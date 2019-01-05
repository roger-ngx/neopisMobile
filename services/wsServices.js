import socketio from 'socket.io-client';
import _ from 'lodash';

import Store from '../store/store';
import prodConf from '../productConf.json';

import logger from '../utils/logger'
const log = logger.getLogger('wsService');
/*
wsService 센서 등록 컨셉:
Register: websocket server로 센서(or 게이트웨이) 정보를 받기 위해 등록하는 센서id를 등록하는 과정.
(webSocket server와 interaction이 있음.)
Subscribe: 등록된 센서로부터 data를 받을지 status를 받을지 받기 원하는 값을 등록하는 과정.
(webSocket server와 interaction 없이 client에서만 안받음.)
실제 사용:
  실제로 사용할 때는 편의를 위해 다음 함수를 통해 register와 subscribe를 동시에 수행함.
  다음함수: wsService.scribeSensor() 또는 subscriber.subscribe()
사용례 1: subscribeSensor 메소드를 이용하는 방법
  이 방법은 오직 하나의 센서만 등록하고 삭제하는 경우에 편리함.
  const unsubscribeSensor = wsService.subscribeSensor(sensor, dataCallback)
  unsubscribeSensor(); // 이거로 바로 위에서 동록한 센서를 해제함.
사용례 2: subscriber 객체를 이용하는 방법
  이 방법은 여러 센서를 등록해서 사용하고 제거하며 사용하는 경유 유용함.
  const subscriber = wsService.newSensorSubscriber(dataCallback, statusCallback) // 로 객체를 생성하고
  subscriber.subscribe(sensor1); // sensor1을 subscribe함.
  subscriber.subscribe(sensor2); // sensor2을 subscribe함.
  subscriber.unsubscribe(sensor1); // sensor1만 unsubscribe함.
  subscriber.unsubscribe(); // 그동안 등록한 모든 센서를 unsubscribe함.
  // 이전에 등록된 센서를 제거하면서 등록하는 방법.
  subscriber.subscribe(sensor1); // sensor1을 subscribe함.
  subscriber.subscribe(sensor2, true); // sensor1을 제거 하면서 sensor2을 subscribe함.
callback 함수가 받는 인자: dataCallback(data, sensor)
주: unsubscribe를 할 때, subscription은 바로 해제되어 callback을 받지 않게 되지만,
  서버에 register된 sensor는 일정 시간(UNREGISTER_DELAY) 후에 unregister됨.
*/

let socket = null;
let tryReconnect = false;
let isConnect = false;
let registeredGateways = {};
let registeredSensors = {};
let wsSubdomain = 'ws';
let onQueue = [];
let wrappedCallbacks = {};

let WS_USE_DEDICATED_SERVER = false;
const UNREGISTER_DELAY = 30000; // 30 seconds

if (prodConf && prodConf.websocket && prodConf.websocket.subDomain !== wsSubdomain) {
  WS_USE_DEDICATED_SERVER = true;
  wsSubdomain = prodConf.websocket.subDomain;
}

function getWSUrl(namespace = 'mqtt') {
  const originalHost = "neopis.thingplus.net";
  const originalPort = 80;
  const originalHostArray = originalHost.split('.');
  let wsHost = originalHost;

  if (originalHostArray.length > 0) {
    if (WS_USE_DEDICATED_SERVER) {
      originalHostArray[0] = wsSubdomain;
    }

    if (_.includes([80, 443], originalPort)) {
      wsHost = originalHostArray.join('.');
    } else {
      wsHost = `${originalHostArray.join('.')}:${originalPort}`;
    }
  }

  const wsUrl = `${wsHost}/${namespace}`;

  log.debug('[wsService] wsUrl', originalHost, originalPort, wsUrl);

  return wsUrl;
}

function registerWsBulk(eventName, registeredGS, gsIds, retryCountDown = 10) {
  // const userId = userService.getUserId();

  const userId = _.get(Store.getState(), 'currentUser.loginId');
  if (!userId && retryCountDown) {
    // userService가 사용자 정보를 로딩해오는데 시간이 걸릴 경우에도 정상동작하기 위한 재시도.
    // 단 최대 10번까지만 재시도하고 안되면 에러메시지 내고 끝냄.
    setTimeout(() => {
      if (retryCountDown < 9) {
        log.warn(`retry registerWsBulk ${eventName} ${gsIds} to retry count down:${retryCountDown}`);
      }
      registerWsBulk(eventName, registeredGS, gsIds, retryCountDown - 1);
    }, 500);
    return;
  }

  if (retryCountDown === 0) {
    log.error('Could not get userId from userId from userService!!!');
    return;
  }

  // 기존에 추가했던 것은 filter로 제외하고 새로 추가된 것만 등록하도록 함.
  const toRegisterIds = _.filter(gsIds, gsId => !registeredGS[gsId]);

  _.forEach(toRegisterIds, (gsId) => {
    registeredGS[gsId] = true;
  });

  log.trace('toRegisterIds:', toRegisterIds);
  if (socket && !_.isEmpty(toRegisterIds)) {
    socket.emit(eventName, { gsIds: toRegisterIds, userId });
  }
}

function registerSensorBulk(sensorIds) {
  registerWsBulk('sensors:register', registeredSensors, sensorIds);
}

function registerGatewayBulk(gatewayIds) {
  registerWsBulk('gateways:register', registeredGateways, gatewayIds);
}

function addPathListener(path, cb) {
  if (socket) {
    socket.on(path, cb);
  } else {
    log.warn('wsService - addPathListener(): socket is NULL:', path);
  }
}

function removePathListener(path, cb) {
  if (socket) {
    socket.off(path, cb);
  } else {
    log.warn('wsService - removePathListener(): socket is NULL:', path);
  }
}

function unregisterWsBulk(eventName, registeredGS, gsIds, filterFn) {
  // NOTE: make a delay for the successive unsub/sub operation.
  // To reduce needlessly frequent unregister/register operation.
  setTimeout(() => {
    const userId = _.get(Store.getState(), 'currentUser.loginId');

    if (!socket) { return; }

    // 제거할 시점에서 socket에 등록된 Listener(callback)가 하나도 없는 놈들만 제거 대상으로 가져옴.
    const toUnregisterIds = _.filter(gsIds, filterFn);
    _.forEach(toUnregisterIds, gsId => delete registeredGS[gsId]);

    if (!_.isEmpty(toUnregisterIds)) {
      socket.emit(eventName, { gsIds: toUnregisterIds, userId });
    }
  }, UNREGISTER_DELAY);
}

function unregisterSensors(sensorIds) {
  unregisterWsBulk('sensors:unregister', registeredSensors, sensorIds, (id) => {
    const statusTopic = `s/${id}/status`;
    const dataTopic = `s/${id}/value`;
    return !socket.hasListeners(dataTopic) && !socket.hasListeners(statusTopic);
  });
}

function unregisterGateways(gatewayIds) {
  unregisterWsBulk('gateways:unregister', registeredGateways, gatewayIds, (id) => {
    const statusTopic = `g/${id}/status`;
    return !socket.hasListeners(statusTopic);
  });
}

function registerAndSubscribeSensor(sensor, cbObj) {
  registerSensorBulk([sensor.id]);
  registerGatewayBulk([sensor.owner]);

  if (cbObj.dataCallback) {
    addPathListener(`s/${sensor.id}/value`, cbObj.dataCallback);
  }

  if (cbObj.statusCallback) {
    addPathListener(`s/${sensor.id}/status`, cbObj.statusCallback);
    addPathListener(`g/${sensor.owner}/status`, cbObj.statusCallback);
  }
}

function unregisterAndUnsubscribe(sensor, cbObj) {
  if (cbObj.dataCallback) {
    removePathListener(`s/${sensor.id}/value`, cbObj.dataCallback);
  }

  if (cbObj.statusCallback) {
    removePathListener(`s/${sensor.id}/status`, cbObj.statusCallback);
    removePathListener(`g/${sensor.owner}/status`, cbObj.statusCallback);
  }

  unregisterSensors([sensor.id]);
  unregisterGateways([sensor.owner]);
}

function initSocketChannel() {
  const wsNamespace = 'mqtt';

  tryReconnect = true;

  if (socket) {
    socket.logout = false;

    if (!isConnect) {
      log.debug('wsService - getSocketChannel(): socket reconnect', socket);
      socket.connect();
    }
    return;
  }

  log.debug('wsService - getSocketChannel: socket is not created, and connect', socket);

  socket = socketio('http://neopis.thingplus.net/mqtt', {
    reconnection: true,
    reconnectionDelay: 1000
  });

  console.log('socket', socket, socket.io.uri);

  log.debug('socket', socket, socket.io.uri);

  ['connect_error', 'connect_timeout', 'reconnect', 'reconnect_attempt',
    'reconnecting', 'reconnect_error', 'reconnect_failed'].forEach((event) => {
      socket.on(event, eventData => log.info('[wsService]', event, eventData));
    });

  socket.on('connect', () => {
  console.log('WebSocket is connected', socket.socket);

    log.info('WebSocket is connected', socket.socket);
    isConnect = true;

    const toRegisterSensorIds = Object.keys(registeredSensors);
    const toRegisterGatewayIds = Object.keys(registeredGateways);
    registeredSensors = {}; // for register again.
    registeredGateways = {};

    registerSensorBulk(toRegisterSensorIds);
    registerGatewayBulk(toRegisterGatewayIds);

    _.forEach(onQueue, cb => cb());
    onQueue = [];
  });

  socket.on('user:logout', () => {
    log.info('wsService - getSocketChannel - logout', socket);

    if (socket) {
      socket.logout = true;
      socket.disconnect();
    }
  });

  socket.on('disconnect', () => {
    log.info('WebSocket is disconnected', socket);

    isConnect = false;
    if (!tryReconnect) {
      return;
    }

    if (socket) {
      if (socket.logout) {
        log.info('wsService - getSocketChannel - disconnect: bug socket not reconnect', socket);
      } else {
        log.info('wsService - getSocketChannel - disconnect: socket reconnect', socket);
        // socket.socket.reconnect();
      }
    }
  });
}

function disconnectSocketChannel(logout) {
  if (socket) {
    tryReconnect = false;
    socket.disconnect();
  }
  if (logout) {
    // reset registeredSensors
    registeredSensors = {};
    registeredGateways = {};
  }
}

function isSocketConnected() {
  return socket && socket.connected;
}

function wrapSensorCallback(target, orgCallback) {
  if (!orgCallback) {
    return orgCallback;
  }

  return function sub(data) {
    orgCallback(data, target);
  };
}

function _subscribeRealtime(path, cb) {
  if (socket) {
    socket.on(path, cb);
  } else {
    log.warn('wsService - _subscribeRealtime(): socket is NULL:', path);
  }
}

function _unsubscribeRealtime(path, cb) {
  if (socket) {
    socket.off(path, cb);
  } else {
    log.warn('wsService - _unsubscribeRealtime(): socket is NULL:', path);
  }
}

function _registerWsBulk(eventName, registeredGS, gsIds) {
  const userId = _.get(Store.getState(), 'currentUser.loginId');

  var toRegisterIds = _.filter(gsIds, function (gsId) {
    return !registeredGS[gsId];
  });

  _.forEach(toRegisterIds, function (gsId) {
    registeredGS[gsId] = true;
  });

  if (socket && !_.isEmpty(toRegisterIds)) {
    socket.emit(eventName, { gsIds: toRegisterIds, userId: userId });
  }
}

function _registerSensorBulk(sensorIds) {
  _registerWsBulk('sensors:register', registeredSensors, sensorIds);
}

function _registerGatewayBulk(gatewayIds) {
  _registerWsBulk('gateways:register', registeredGateways, gatewayIds);
}
function _unregisterWsBulk(eventName, registeredGS, gsIds, filterFn) {
  // NOTE: make a delay for the successive unsub/sub operation.
  // To reduce needlessly frequent unregister/register operation.
  setTimeout(function () {
    const userId = _.get(Store.getState(), 'currentUser.loginId');

    var toUnregisterIds;

    if (!socket) { return; }

    toUnregisterIds = _.filter(gsIds, filterFn);
    _.forEach(toUnregisterIds, function (gsId) {
      delete registeredGS[gsId];
    });

    if (!_.isEmpty(toUnregisterIds)) {
      socket.emit(eventName, { gsIds: toUnregisterIds, userId: userId });
    }
  }, UNREGISTER_DELAY);
}

function _unregisterSensors(sensorIds) {
  _unregisterWsBulk('sensors:unregister', registeredSensors, sensorIds,
    function (id) {
      var statusTopic = 's/' + id + '/status';
      var dataTopic = 's/' + id + '/value';
      return !socket.hasListeners(dataTopic) && !socket.hasListeners(statusTopic);
    });
}

function _unregisterGateways(gatewayIds) {
  _unregisterWsBulk('gateways:unregister', registeredGateways, gatewayIds,
    function (id) {
      var statusTopic = 'g/' + id + '/status';
      return !socket.hasListeners(statusTopic);
    });
}

function _wsSubscribeSensor(sensors, cbObj) {
  _registerSensorBulk(_.map(sensors, 'id'));
  _registerGatewayBulk(_.map(sensors, 'owner'));

  _.forEach(sensors, function (sensor) {
    wrappedCallbacks[sensor.id] = {};

    if (cbObj.dataCallback) {
      wrappedCallbacks[sensor.id].dataCB = wrapSensorCallback(sensor, cbObj.dataCallback);
      _subscribeRealtime('s/' + sensor.id + '/value', wrappedCallbacks[sensor.id].dataCB);
    }

    if (cbObj.statusCallback) {
      wrappedCallbacks[sensor.id].statusCB = wrapSensorCallback(sensor, cbObj.statusCallback);
      _subscribeRealtime('s/' + sensor.id + '/status', wrappedCallbacks[sensor.id].statusCB);
      _subscribeRealtime('g/' + sensor.owner + '/status', wrappedCallbacks[sensor.id].statusCB);
    }
  });
}

function _wsUnsubscribeSensor(sensors, cbObj) {
  _.forEach(sensors, function (sensor) {
    if (cbObj.dataCallback) {
      _unsubscribeRealtime('s/' + sensor.id + '/value', wrappedCallbacks[sensor.id].dataCB);
      delete wrappedCallbacks[sensor.id].dataCB;
    }

    if (cbObj.statusCallback) {
      _unsubscribeRealtime('s/' + sensor.id + '/status', wrappedCallbacks[sensor.id].statusCB);
      _unsubscribeRealtime('g/' + sensor.owner + '/status', wrappedCallbacks[sensor.id].statusCB);
      delete wrappedCallbacks[sensor.id].statusCB;
    }

    delete wrappedCallbacks[sensor.id];
  });

  _unregisterSensors(_.map(sensors, 'id'));
  _unregisterGateways(_.map(sensors, 'owner'));
}

export default {
  /**
   * subscribeSensor - 센서등록(및 subscription).
   *
    이 방법은 오직 하나의 센서만 등록하고 삭제하는 경우에 편리함.
    const unsubscribeSensor = wsService.subscribeSensor(sensor, dataCallback)
    unsubscribeSensor(); // 이거로 바로 위에서 동록한 센서를 해제함.
   *
   * @param  {Object} sensor         등록할 센서객체 (id와 owner 속성 필수!)
   * @param  {Function} dataCallback   data subscription callback
   * @param  {Function} statusCallback status subscription callback
   * @return {Function}                등록된 센서를 unsubscribe할 함수
   */
  subscribeSensor(sensor, dataCallback, statusCallback) {
    const cbObj = {
      dataCallback: wrapSensorCallback(sensor, dataCallback),
      statusCallback: wrapSensorCallback(sensor, statusCallback)
    };
    const sensorObj = {
      id: sensor.id,
      owner: sensor.owner
    };
    registerAndSubscribeSensor(sensorObj, cbObj);
    return unregisterAndUnsubscribe.bind(null, sensorObj, cbObj);
  },
  subscribeSensors: function (sensors, dataCallback, statusCallback) {
    var cbObj = { dataCallback: dataCallback, statusCallback: statusCallback };
    var _sensors = [];

    if (_.isArray(sensors)) {
      _.forEach(sensors, function (sensor) {
        _sensors.push({ id: sensor.id, owner: sensor.owner });
      });
    } else {
      _sensors.push({ id: sensors.id, owner: sensors.owner });
    }

    _wsSubscribeSensor(_sensors, cbObj);
    return _wsUnsubscribeSensor.bind(null, _sensors, cbObj);
  },
  subscribeGatewayStatus(gatewayId, statusCallback) {
    this.registerRealtimeGateway(gatewayId);
    addPathListener(`g/${gatewayId}/status`, statusCallback);

    return function unregisterGatewayStatus() {
      removePathListener(`g/${gatewayId}/status`, statusCallback);
      unregisterGateways([gatewayId]);
    };
  },
  /**
   *
   *  newSensorSubscriber - 센서 subscription 객체 생성
   *
      이 방법은 여러 센서를 등록해서 사용하고 제거하며 사용하는 경유 유용함.
      const subscriber = wsService.newSensorSubscriber(dataCallback, statusCallback) // 로 객체를 생성하고
      subscriber.subscribe(sensor1); // sensor1을 subscribe함.
      subscriber.subscribe(sensor2); // sensor2을 subscribe함.
      subscriber.unsubscribe(sensor1); // sensor1만 unsubscribe함.
      subscriber.unsubscribe(); // 그동안 등록한 모든 센서를 unsubscribe함.
      // 이전에 등록된 센서를 제거하면서 등록하는 방법.
      subscriber.subscribe(sensor1); // sensor1을 subscribe함.
      subscriber.subscribe(sensor2, true); // sensor2을 subscribe함.
   * @param  {function} dataCallback
   * @param  {function} statusCallback
   * @return {object}   sensor subsription object
   */
  newSensorSubscriber(dataCallback, statusCallback) {
    const self = this;
    const unsubscribeMap = {};

    return {

      /**
       * subscribe - sensor를 서버에 등록하고 callback 함수에 따라 subscription도 함께 수행함.
       *
       * @param  {Object} sensor         등록할 센서객체 (id와 owner 속성 필수!)
       * @param  {boolean} forceUnsubscribe true 이면 이전에 등록한 센서를 모두 unsubscribe하고 등록함.
       */
      subscribe(sensor, forceUnsubscribe) {
        if (forceUnsubscribe) {
          this.unsubscribe(); // unsubscribe if previously subscribed.
        }
        unsubscribeMap[sensor.id] = self.subscribeSensor(sensor, dataCallback, statusCallback);
      },

      /**
       * unsubscribe - 센서를 해제하는데 sensor를 지정하지 않으면 그동안 등록한 모든 센서를 모두 해제함.
       *
       * @param  {type} sensor unsubscribe할 센서. (이 sensor가 없으면 그동안 등록한 모든 센서를 해제함.)
       */
      unsubscribe(sensor) {
        if (sensor) {
          const unsubscribeFn = unsubscribeMap[sensor.id];
          unsubscribeFn && unsubscribeFn();
          delete unsubscribeMap[sensor.id];
          return;
        }

        _.forOwn(unsubscribeMap, (unsub, id) => {
          unsub && unsub();
          delete unsubscribeMap[id];
        });
      }
    };
  },
  on(path, cb) {
    if (isConnect) {
      addPathListener(path, cb);
    } else {
      onQueue.push(() => {
        addPathListener(path, cb);
      });
    }
  },
  off(path, cb) {
    if (isConnect) {
      removePathListener(path, cb);
    } else {
      onQueue = [];
    }
  },
  initSocketChannel,
  disconnectSocketChannel,
  isSocketConnected,
};