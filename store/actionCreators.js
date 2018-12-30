import userService from "../services/userService";
import sensorService from "../services/sensorService";
import _ from 'lodash';

export const UPDATE_DATE_TIME = 'UPDATE_DATE_TIME';
export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const UPDATE_LOCATION = 'UPDATE_LOCATION';
export const UPDATE_SOLAR_ENERGY = 'UPDATE_SOLAR_ENERGY';
export const UPDATE_ESS_DISCHARGE = 'UPDATE_ESS_DISCHARGE';
export const UPDATE_ESS_CHARGE = 'UPDATE_ESS_CHARGE';
export const UPDATE_GRID_ENERGY = 'UPDATE_GRID_ENERGY';
export const UPDATE_SUMMARY_CHART = 'UPDATE_SUMMARY_CHART';
export const UPDATE_CURRENT_USER = 'UPDATE_CURRENT_USER';
export const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA';
export const INITIAL_CHART_DATA = 'INITIAL_CHART_DATA';
export const UPDATE_ESS_STATUS = 'UPDATE_ESS_STATUS';
export const UPDATE_BATTERY_STATUS = 'UPDATE_BATTERY_STATUS';

export const updateDateTime = content => ({
  type: UPDATE_DATE_TIME,
  content
});

export const updateWeather = content => ({
  type: UPDATE_WEATHER,
  content
});

export const updateLocation = content => ({
  type: UPDATE_LOCATION,
  content
});

export const updateSolarEnergy = content => ({
  type: UPDATE_SOLAR_ENERGY,
  content
});

export const updateBatteryStatus = content => ({
  type: UPDATE_BATTERY_STATUS,
  content
})

export const updateESSDischarge = content => ({
  type: UPDATE_ESS_DISCHARGE,
  content
});

export const updateESSStatus = content => ({
  type: UPDATE_ESS_STATUS,
  content
});

export const updateESSCharge = content => ({
  type: UPDATE_ESS_CHARGE,
  content
});

export const updateGridEnergy = content => ({
  type: UPDATE_GRID_ENERGY,
  content
});

export const updateSummaryChart = content => ({
  type: UPDATE_SUMMARY_CHART,
  content
});

export const updateCurrentUser = content => ({
  type: UPDATE_CURRENT_USER,
  content
});

export const initialChartData = content => ({
  type: INITIAL_CHART_DATA,
  content
});

export const updateChartData = content => ({
  type: UPDATE_CHART_DATA,
  content
});

export const getUsersMe = () => dispatch => userService.me().then(res => dispatch(updateCurrentUser(res.data)))

export const getInitialDataForChart =
  (gwId, params, sensorIds) =>
    dispatch =>
      sensorService.getSensorsData(gwId, params)
        .then(res => {
          const sensorData = _.filter(_.get(res, 'data.data.sensors'), data => _.isObject(data))
            .map(data => _.pick(data, ['name', 'id', 'series.data']));

          const sortedSensors = [];

          _.forEach(sensorIds, sensorId => {
            const sensor = _.filter(sensorData, sensor => sensor.id === sensorId);
            sensor.length && sortedSensors.push(sensor[0]);
          })

          sensorData && dispatch(initialChartData(sortedSensors))
        });

