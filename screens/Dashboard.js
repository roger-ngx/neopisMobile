/**
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { PagerDotIndicator, IndicatorViewPager } from 'rn-viewpager';
import _ from 'lodash';
import { connect } from 'react-redux';

import { SOURCE } from '../components/CurrentElectricityValue';
import CurentLocation from '../components/CurrentLocation'
import CurrentWeather from '../components/CurrentWeather';
import CurrentMoment from '../components/CurrentMoment';
import CurrentElectricityValue from '../components/CurrentElectricityValue';
import CurrentPowerPercentage from '../components/CurrentPowerPercentage';
import PowerLineChart from '../components/PowerLineChart'

if(__DEV__) {
  import('../ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

import {
  getUsersMe,
  initialChartData,
  updateChartData,
  updateDateTime,
  updateWeather,
  updateSolarEnergy,
  updateGridEnergy,
  updateESSDischarge,
  updateESSCharge,
  updateESSStatus,
  updateBatteryStatus,
  updateLocation
} from '../store/actionCreators';

import gwInfo from './gatewayInfo';
import sensorService from '../services/sensorService';
import socket from '../services/wsServices';

const SERIES_DATA_PATH = 'data.series.value';
class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.wsSubscribers = [];
  }

  _renderDotIndicator() {
    return <PagerDotIndicator pageCount={3} />;
  }

  componentDidMount() {
    this.props.onFetchingCurrentUser();
    socket.initSocketChannel();

    this.init();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar}>
          <StatusBar />
        </View>
        <View style={styles.currents}>
          <CurrentMoment />
          <CurrentWeather temperature={27} humidity={80} />
          <CurentLocation />
        </View>

        <IndicatorViewPager
          style={styles.viewPager}
          indicator={this._renderDotIndicator()}>
          <View style={styles.pageStyle}>
            <View style={styles.electricValues}>
              <CurrentElectricityValue type={SOURCE} value='3456.7' unit='MWh' description='This month' />
              <CurrentElectricityValue type={SOURCE} value='9821.3' unit='kWh' description='Today' />
            </View>
            <View style={styles.electricValues}>
              <CurrentPowerPercentage />
            </View>
          </View>
        </IndicatorViewPager>

        <View style={styles.chart}>
          <PowerLineChart />
        </View>
      </View >
    );
  }

  init() {
    this.gatewayInfo = _.pick(gwInfo, ['name', 'gwId', 'meta', 'sensors']);

    if (!_.isEmpty(this.gatewayInfo)) {
      this.initChartData();
      this.initAndSubscribeWeatherData();
      this.initAndSubscribeSolarData();
      this.initAndSubscribeGridEnergyData();
      this.initAndSubscribeDischargeESSData();
      this.initAndSubscribeChargeESSData();
      this.initAndSubscribeBatteryStatus();
    }
  }

  initAndSubscribeBatteryStatus() {
    //subscribe sensors for ws
    const manualStatus = {
      id: this.gatewayInfo.sensors.manualStatus,
      owner: this.gatewayInfo.gwId
    };
    this.wsSubscribers.push(
      socket.subscribeSensor(manualStatus,
        data => +data.value && this.props.onUpdateBatteryStatus(MANUAL))
    );

    const automaticStatus = {
      id: this.gatewayInfo.sensors.automaticStatus,
      owner: this.gatewayInfo.gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(automaticStatus,
        data => +data.value && this.props.onUpdateBatteryStatus(AUTOMATIC))
    );

    //query for the 1st data

    this.getSensorValues(this.gatewayInfo.gwId,
      [
        this.gatewayInfo.sensors.manualStatus,
        this.gatewayInfo.sensors.automaticStatus
      ]).then(res => {
        const sensorData = _.filter(_.get(res, 'data.data.sensors'), data => _.isObject(data))
          .map(data => _.pick(data, ['name', 'id', 'series.value']));

        _.forEach(sensorData, data => {
          const value = +_.get(data, 'series.value', '');

          if (data.id === this.gatewayInfo.sensors.manualStatus) {
            value && this.props.onUpdateBatteryStatus(MANUAL);
          }

          if (data.id === this.gatewayInfo.sensors.automaticStatus) {
            value && this.props.onUpdateBatteryStatus(AUTOMATIC);
          }
        })
      });
  }

  initAndSubscribeSolarData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;

    //subscribe sensors for ws
    const monthlySolarGenEnergy = {
      id: sensors.monthlySolarGenEnergy,
      owner: gwId
    };
    this.wsSubscribers.push(socket.subscribeSensor(monthlySolarGenEnergy,
      data => this.props.onUpdateSolarEnergy({ thisMonth: +(+data.value / 1000).toFixed(1) })));

    const dailySolarGenEnergy = {
      id: sensors.dailySolarGenEnergy,
      owner: gwId
    }
    this.wsSubscribers.push(socket.subscribeSensor(dailySolarGenEnergy,
      data => this.props.onUpdateSolarEnergy({ today: parseInt(data.value) })));

    const solargenPower = {
      id: sensors.solargenPower,
      owner: gwId
    }
    this.wsSubscribers.push(socket.subscribeSensor(solargenPower, (data, info) => {
      this.props.onUpdateSolarEnergy({ curPower: (+data.value).toFixed(1) });

      this.props.onUpdateChartData({
        id: info.id,
        owner: info.owner,
        time: data.time,
        value: data.value
      });
    }));

    //query for the 1st data
    this.getSensorValues(gwId,
      [
        sensors.monthlySolarGenEnergy,
        sensors.dailySolarGenEnergy,
        sensors.solarInstallationCapacity,
        sensors.solargenPower
      ]).then(res => {
        const sensorData = _.filter(_.get(res, 'data.data.sensors'), data => _.isObject(data))
          .map(data => _.pick(data, ['name', 'id', 'series.value']));

        _.forEach(sensorData, data => {
          if (data.id === sensors.monthlySolarGenEnergy) {
            this.props.onUpdateSolarEnergy({
              thisMonth: +(+_.get(data, 'series.value', '') / 1000).toFixed(1)
            });
            return;
          }

          if (data.id === sensors.dailySolarGenEnergy) {
            this.props.onUpdateSolarEnergy({
              today: parseInt(_.get(data, 'series.value', ''))
            });
            return;
          }

          if (data.id === sensors.solarInstallationCapacity) {
            this.props.onUpdateSolarEnergy({
              capacity: +_.get(data, 'series.value', '')
            });
            return;
          }

          if (data.id === sensors.solargenPower) {
            this.props.onUpdateSolarEnergy({
              curPower: (+_.get(data, 'series.value', '')).toFixed(1)
            });
            return;
          }
        })
      });
  }

  initAndSubscribeGridEnergyData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;

    //subscribe sensors for ws
    const monthlyGridEnergy = {
      id: sensors.monthlyGridEnergy,
      owner: gwId
    };
    this.wsSubscribers.push(
      socket.subscribeSensor(monthlyGridEnergy,
        data => this.props.onUpdateGridEnergy({
          thisMonth: +(+data.value / 1000).toFixed(1)
        }))
    );

    const dailyGridEnergy = {
      id: sensors.dailyGridEnergy,
      owner: gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(dailyGridEnergy,
        data => this.props.onUpdateGridEnergy({
          today: parseInt(data.value)
        }))
    );

    const gridPower = {
      id: sensors.gridPower,
      owner: gwId
    }
    this.wsSubscribers.push(socket.subscribeSensor(gridPower, (data, info) => {
      this.props.onUpdateGridEnergy({ curPower: (+data.value).toFixed(1) });

      this.props.onUpdateChartData({
        id: info.id,
        owner: info.owner,
        time: data.time,
        value: data.value
      });
    }));

    //query for the 1st data
    var query = {
      embed: ['series'],
    };

    sensorService.getSensorData(gwId, sensors.monthlyGridEnergy, query)
      .then(res => this.props.onUpdateGridEnergy({
        thisMonth: +(+_.get(res.data, SERIES_DATA_PATH, '') / 1000).toFixed(1)
      }));

    sensorService.getSensorData(gwId, sensors.dailyGridEnergy, query)
      .then(res => this.props.onUpdateGridEnergy({
        today: parseInt(_.get(res.data, SERIES_DATA_PATH, ''))
      }));

    sensorService.getSensorData(gwId, sensors.gridInstallationCapacity, query)
      .then(res => this.props.onUpdateGridEnergy({
        capacity: +_.get(res.data, SERIES_DATA_PATH, '')
      }));

    sensorService.getSensorData(gwId, sensors.gridPower, query)
      .then(res => this.props.onUpdateGridEnergy({
        curPower: (+_.get(res.data, SERIES_DATA_PATH, '')).toFixed(1)
      }));
  }

  initAndSubscribeDischargeESSData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;

    //subscribe sensors for ws
    const monthlyESSDischargeEnergy = {
      id: sensors.monthlyESSDischargeEnergy,
      owner: gwId
    };
    this.wsSubscribers.push(
      socket.subscribeSensor(monthlyESSDischargeEnergy,
        data => this.props.onUpdateESSDischarge({
          thisMonth: +(+data.value / 1000).toFixed(1)
        }))
    );

    const dailyESSDischargeEnergy = {
      id: sensors.dailyESSDischargeEnergy,
      owner: gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(dailyESSDischargeEnergy,
        data => this.props.onUpdateESSDischarge({
          today: parseInt(data.value)
        }))
    );

    const batteryRate = {
      id: sensors.batteryRate,
      owner: gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(batteryRate,
        data => this.props.onUpdateESSDischarge({
          batteryRate: (+data.value).toFixed(1)
        }))
    );

    //query for the 1st data
    var query = {
      embed: ['series'],
    };

    sensorService.getSensorData(gwId, sensors.monthlyESSDischargeEnergy, query)
      .then(res => this.props.onUpdateESSDischarge({
        thisMonth: parseInt(_.get(res.data, SERIES_DATA_PATH, '') / 1000)
      }));

    sensorService.getSensorData(gwId, sensors.dailyESSDischargeEnergy, query)
      .then(res => this.props.onUpdateESSDischarge({
        today: parseInt(_.get(res.data, SERIES_DATA_PATH, ''))
      }));

    sensorService.getSensorData(gwId, sensors.batteryRate, query)
      .then(res => this.props.onUpdateESSDischarge({
        batteryRate: parseInt(_.get(res.data, SERIES_DATA_PATH, ''))
      }));
  }

  initAndSubscribeChargeESSData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;

    //subscribe sensors for ws
    const monthlyESSChargeEnergy = {
      id: sensors.monthlyESSChargeEnergy,
      owner: gwId
    };
    this.wsSubscribers.push(
      socket.subscribeSensor(monthlyESSChargeEnergy,
        data => this.props.onUpdateESSCharge({
          thisMonth: +(+data.value / 1000).toFixed(1)
        }))
    );

    const dailyESSChargeEnergy = {
      id: sensors.dailyESSChargeEnergy,
      owner: gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(dailyESSChargeEnergy,
        data => this.props.onUpdateESSCharge({
          today: data.value
        }))
    );

    const eSSChargePower = {
      id: sensors.eSSChargePower,
      owner: gwId
    }
    this.wsSubscribers.push(socket.subscribeSensor(eSSChargePower, (data, info) => {
      const curPower = +data.value;
      this.props.onUpdateESSCharge({ curPower: Math.abs(curPower).toFixed(1) });
      this.props.onUpdateESSStatus(curPower < 0);

      this.props.onUpdateChartData({
        id: info.id,
        owner: info.owner,
        time: data.time,
        value: data.value
      });
    }));

    //query for the 1st data
    var query = {
      embed: ['series'],
    };

    sensorService.getSensorData(gwId, sensors.monthlyESSChargeEnergy, query)
      .then(res => this.props.onUpdateESSCharge({
        thisMonth: +(+_.get(res.data, SERIES_DATA_PATH, '') / 1000).toFixed(1)
      }));

    sensorService.getSensorData(gwId, sensors.dailyESSChargeEnergy, query)
      .then(res => this.props.onUpdateESSCharge(
        { today: +_.get(res.data, SERIES_DATA_PATH, '') }
      ));

    sensorService.getSensorData(gwId, sensors.ESSInstallationCapacity, query)
      .then(res => this.props.onUpdateESSCharge({
        capacity: +_.get(res.data, SERIES_DATA_PATH, '')
      }));

    sensorService.getSensorData(gwId, sensors.eSSChargePower, query)
      .then(res => {
        const curPower = +_.get(res.data, SERIES_DATA_PATH, '');
        this.props.onUpdateESSCharge({ curPower: Math.abs(curPower).toFixed(1) });
        this.props.onUpdateESSStatus(curPower < 0);
      });
  }

  initAndSubscribeWeatherData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;
    const weather = this.gatewayInfo.meta.weather;

    //subscribe sensors for ws
    const tempSensor = {
      id: sensors.temperature,
      owner: gwId
    };
    this.wsSubscribers.push(
      socket.subscribeSensor(tempSensor,
        data => this.props.onUpdateWeather({ temperature: data.value }))
    );

    const humiditySensor = {
      id: sensors.humidity,
      owner: gwId
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(humiditySensor,
        data => this.props.onUpdateWeather({ humidity: data.value }))
    );

    const weatherSensor = {
      id: weather.id,
      owner: weather.owner
    }
    this.wsSubscribers.push(
      socket.subscribeSensor(weatherSensor,
        data => this.props.onUpdateWeather({ weather: data.value }))
    );

    //query for the 1st data
    var query = {
      embed: ['series'],
    };

    sensorService.getSensorData(gwId, sensors.temperature, query)
      .then(res =>
        this.props.onUpdateWeather({
          temperature: +_.get(res.data, SERIES_DATA_PATH, '')
        })
      );

    sensorService.getSensorData(gwId, sensors.humidity, query)
      .then(res =>
        this.props.onUpdateWeather({
          humidity: +_.get(res.data, SERIES_DATA_PATH, '')
        })
      );

    sensorService.getSensorData(weather.owner, weather.id, query)
      .then(res =>
        this.props.onUpdateWeather({
          weather: _.get(res.data, SERIES_DATA_PATH, '')
        })
      );
  }

  initChartData() {
    const sensors = this.gatewayInfo.sensors;
    const gwId = this.gatewayInfo.gwId;
    const endTime = new Date();
    const startTime = endTime - 24 * 60 * 60 * 1000;

    const sensorIds = [
      sensors.solargenPower,
      sensors.eSSChargePower,
      sensors.gridPower
    ];

    this.getSensorSeries(gwId, sensorIds, startTime, endTime, '5m')
      .then(res => {
        this.processDataForChart(res.data, sensorIds, startTime, endTime);
        this.props.onUpdateLocation(_.get(res.data, 'data.location.address'));
      })
  }

  getSensorValues(gwId, sensorIds) {
    const query = {
      embed: 'sensors',
      'sensors[embed]': 'series',
      'sensors[filter][id]': sensorIds
    };

    return sensorService.getSensorsData(gwId, query);
  }

  getSensorSeries(gwId, sensorIds, startTime, endTime, interval = '0m') {
    const query = {
      embed: 'sensors',
      'sensors[embed]': 'series',
      'sensors[series][dataStart]': (new Date(startTime)).toISOString(),
      'sensors[series][dataEnd]': (new Date(endTime)).toISOString(),
      'sensors[series][interval]': interval
    };

    if (!_.isEmpty(sensorIds)) {
      query['sensors[filter][id]'] = sensorIds;
    }

    return sensorService.getSensorsData(gwId, query);
  }

  processDataForChart(data, sensorIds, startTime, endTime) {
    const sensorData = _.filter(_.get(data, 'data.sensors'), data => _.isObject(data))
      .map(data => _.pick(data, ['name', 'id', 'series.data']));

    const durationInMs = 5 * 60 * 1000;

    _.forEach(sensorData, data => {
      const seriesData = _.get(data, 'series.data', []);

      const length = seriesData.length;

      if (length) {
        const min = seriesData[1];
        const max = seriesData[length - 1];

        let index = 0;
        for (let time = min; time < max; time += durationInMs) {
          if (seriesData[2 * index + 1] === time) {
            index++;
            continue;
          } else {
            seriesData.splice(2 * index, 0, null, time);
            index++;
          }
        }

        for (let time = min - durationInMs; time > startTime; time -= durationInMs) {
          seriesData.unshift(null, time);
        }

        for (let time = max + durationInMs; time < endTime; time += durationInMs) {
          seriesData.push(null, time);
        }
      } else {
        for (let time = endTime; time > startTime; time -= durationInMs) {
          seriesData.unshift(null, time);
        }
      }
    });

    const sortedSensorData = [];

    _.forEach(sensorIds, sensorId => {
      const sensor = _.filter(sensorData, sensor => sensor.id === sensorId);
      sensor.length && sortedSensorData.push(sensor[0]);
    })

    this.props.onInitialChartData(sortedSensorData);
  }

  componentWillUnmount() {
    _.forEach(this.wsSubscribers, unsubscriber => unsubscriber());

    socket.disconnectSocketChannel();
  }
}

const mapStateToProps = state => ({
  solarEnergy: state.solarEnergy,
  electricityInfo: state.generatedElectricity,
  ESSDischarge: state.ESSDischarge,
  ESSCharge: state.ESSCharge,
  isESSCharging: state.isESSCharging,
  batteryStatus: state.batteryStatus
});

const mapDispatchToProps = dispatch => ({
  onUpdateWeather: data => dispatch(updateWeather(data)),
  onUpdateDateTime: ([date, time]) => date && time && dispatch(updateDateTime({ date, time })),
  onUpdateLocation: location => dispatch(updateLocation(location)),
  onFetchingCurrentUser: () => dispatch(getUsersMe()),
  onInitialChartData: (sensorData) => dispatch(initialChartData(sensorData)),
  onUpdateChartData: data => dispatch(updateChartData(data)),
  onUpdateSolarEnergy: data => dispatch(updateSolarEnergy(data)),
  onUpdateGridEnergy: data => dispatch(updateGridEnergy(data)),
  onUpdateESSDischarge: data => dispatch(updateESSDischarge(data)),
  onUpdateESSCharge: data => dispatch(updateESSCharge(data)),
  onUpdateESSStatus: data => dispatch(updateESSStatus(data)),
  onUpdateBatteryStatus: data => dispatch(updateBatteryStatus(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0d0f',
  },
  statusBar: {
    height: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    backgroundColor: 'white'
  },
  currents: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 71,
  },
  chart: {
    flex: 1
  },
  viewPager: {
    height: 200,
    alignSelf: "stretch",
    marginTop: 20,
  },
  pageStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#18161a',
    paddingVertical: 10,
    paddingHorizontal: 40
  },
  electricValues: {
    flex: 0,
    justifyContent: 'space-evenly',
    backgroundColor: '#18161a'
  }
});
