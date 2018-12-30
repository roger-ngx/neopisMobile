import axios from 'axios';

let config;
axios.get('/asset/productConf.json').then((result) => {
  config = result.data;
  console.debug('productConf:', config);
});

export default {
  getConfig() {
    return config;
  }
};