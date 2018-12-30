import React from 'react';
import { StyleSheet, View } from 'react-native';
import Dashboard from './screens/Dashboard';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Dashboard />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
