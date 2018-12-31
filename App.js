import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';

import store from './store/store'
import Dashboard from './screens/Dashboard';

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <Dashboard />
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
