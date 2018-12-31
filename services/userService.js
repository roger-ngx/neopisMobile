import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Authorization'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MjY5IiwiY2xpZW50SWQiOiJuZW9waXMiLCJpYXQiOjE1NDU3MjAwMjcsImV4cCI6MTU0NzAxNjAyN30.7RBda_sXQuqd_TPbmar-22bdED9ocSYXz43boQLumeM';
const API_HOST = 'https://neopis.thingplus.net'

export default {
  me() {
    return axios.get(API_HOST + '/api/users/me');
  },
  logout() {
    return axios.post(API_HOST + '/api/v2/logout');
  },
  saveUserAccount(data) {
    return axios.put(API_HOST + '/api/users/me', data);
  },
  changePassword(data) {
    return axios.post(API_HOST + '/api/changePassword', data);
  },
  askMobileAuth(data) {
    return axios.post(API_HOST + '/api/users/me/mobile', data);
  },
  saveUserMobile(data) {
    return axios.put(API_HOST + '/api/users/me/mobile', data);
  },
};