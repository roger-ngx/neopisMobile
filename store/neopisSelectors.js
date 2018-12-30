import _ from 'lodash';
import { createSelector } from 'reselect';

const TIME = 1, VALUE = 0;

const getSummaryChartData = state => state.summaryChart;

const getNames = datas => _.map(datas, data => data.name); // ['sensor1', 'sensor2','sensor3']

const getSensorSeriesData = datas => _.map(datas, data => {
  const series = _.get(data, 'series.data');
  const sensorDatas = [[], []];
  _.forEach(series, (data, index) => {
      sensorDatas[index % 2].push(data);
  });

  return sensorDatas;
});

const getDataForChart = (sensorNames, sensorDatas) => {
  return _.map(sensorNames, (name, index) => {
    const times = sensorDatas[index][TIME];
    const values = sensorDatas[index][VALUE];

    return { name,  values: _.map(values, (value, i) => ({ time: times[i], value })) }
  })
}

export const nameSelector = createSelector(
  getSummaryChartData,
  getNames
)

export const sensorDataSelector = createSelector(
  getSummaryChartData,
  getSensorSeriesData
)

export const chartDataSelector = createSelector(
  nameSelector,
  sensorDataSelector,
  getDataForChart
)