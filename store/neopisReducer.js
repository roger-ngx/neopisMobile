import {
  UPDATE_DATE_TIME,
  UPDATE_WEATHER,
  UPDATE_LOCATION,
  UPDATE_SOLAR_ENERGY,
  UPDATE_ESS_CHARGE,
  UPDATE_ESS_DISCHARGE,
  UPDATE_BATTERY_STATUS,
  UPDATE_GRID_ENERGY,
  UPDATE_CURRENT_USER,
  UPDATE_CHART_DATA,
  INITIAL_CHART_DATA,
  UPDATE_ESS_STATUS
} from "./actionCreators";

import _ from 'lodash';

const initialState = {
  dateTime: {
    date: '',
    time: ''
  },
  weather: {
    temperature: 0,
    humidity: 0
  },
  location: '',
  solarEnergy: {
    thisMonth: 0,
    today: 0,
    capacity: 0,
    curPower: 0,
    percentage: 0
  },
  ESSDischarge: {
    thisMonth: 0,
    today: 0,
    batteryRate: 0,
  },
  isESSCharging: false,
  batteryStatus: 0,
  ESSCharge: {
    thisMonth: 0,
    today: 0,
    percentage: 0,
  },
  generatedElectricity: {
    thisMonth: 0,
    today: 0,
    capacity: 0,
    curPower: 0,
    percentage: 0
  },
  summaryChart: {
    data: [[], [], []]
  }
};

export function neopisReducer(state = initialState, action) {
  const newState = _.cloneDeep(state);

  switch (action.type) {
    case UPDATE_DATE_TIME:
      newState.dateTime = action.content
      return newState;

    case UPDATE_WEATHER:
      newState.weather = { ...newState.weather, ...action.content };

      return newState;

    case UPDATE_LOCATION:
      newState.location = action.content;
      return newState;

    case UPDATE_BATTERY_STATUS:
      newState.batteryStatus = action.content;
      return newState;

    case UPDATE_SOLAR_ENERGY:
      newState.solarEnergy = { ...newState.solarEnergy, ...action.content };

      if (newState.solarEnergy.capacity) {
        newState.solarEnergy.percentage = Math.ceil(newState.solarEnergy.curPower * 100 / newState.solarEnergy.capacity);
      }
      return newState;

    case UPDATE_ESS_DISCHARGE:
      newState.ESSDischarge = { ...newState.ESSDischarge, ...action.content };

      return newState;

    case UPDATE_ESS_CHARGE:
      newState.ESSCharge = { ...newState.ESSCharge, ...action.content };
      if (newState.ESSCharge.capacity) {
        newState.ESSCharge.percentage = Math.ceil(newState.ESSCharge.curPower * 100 / newState.ESSCharge.capacity);
      }

      return newState;

    case UPDATE_ESS_STATUS:
      newState.isESSCharging = action.content;
      return newState;

    case UPDATE_GRID_ENERGY:
      newState.generatedElectricity = { ...newState.generatedElectricity, ...action.content };

      if (+newState.generatedElectricity.capacity) {
        newState.generatedElectricity.percentage = Math.ceil(newState.generatedElectricity.curPower * 100 / newState.generatedElectricity.capacity);
      }

      return newState;

    case UPDATE_CURRENT_USER:
      newState.currentUser = action.content;
      return newState;

    case UPDATE_CHART_DATA:
      const content = action.content;
      const { id, value, time } = content;

      const chartData = _.find(newState.summaryChart, data => data.id === id);

      const seriesData = _.get(chartData, 'series.data');

      if (chartData && seriesData) {
        seriesData.push(value, time);
        if (seriesData[seriesData.length - 1] - seriesData[1] > 24 * 60 * 60 * 1000) {
          seriesData.splice(0, 2);
        }
      };
      return newState;

    case INITIAL_CHART_DATA:
      newState.summaryChart = _.cloneDeep(newState.summaryChart);
      newState.summaryChart = action.content;
      return newState;

    default:
      return state;
  }
}