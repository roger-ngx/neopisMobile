import axios from 'axios';
axios.defaults.headers.common['Authorization'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MjY5IiwiY2xpZW50SWQiOiJuZW9waXMiLCJpYXQiOjE1NDU3MjAwMjcsImV4cCI6MTU0NzAxNjAyN30.7RBda_sXQuqd_TPbmar-22bdED9ocSYXz43boQLumeM';
const API_HOST = 'https://neopis.thingplus.net'

export default {
  getGatewayInfo(gwId){
    return axios.get(`${API_HOST}/api/v2/gateways/${gwId}`);
  },
  getSensorData(gwId, sensorId, params) {
    return axios.get(`${API_HOST}/api/v2/gateways/${gwId}/sensors/${sensorId}`, {params});
  },
  getSensorsData(gwId, params) {
    return axios.get(`${API_HOST}/api/v2/gateways/${gwId}`, {params});
  },
}