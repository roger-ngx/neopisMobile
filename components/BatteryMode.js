import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const ABNORMAL = 1, MANUAL = 2, AUTOMATIC = 3;

const styles = StyleSheet.create({
  bm_container: {
    width: 87,
    height: 30,
    borderRadius: 15,
    borderColor: '#7ed321',
    borderWidth: 1,
    borderStyle: 'solid',
    textAlign: 'center',
    margin: 9
  },
  bm_content: {
    height: 30,
    fontSize: 12,
    color: '#7ed321'
  }
})

const BatteryMode = props => {

  let status = (status) => {
    if (status === ABNORMAL) return 'Abnormal';
    if (status === MANUAL) return 'Manual';
    if (status === AUTOMATIC) return 'Automatic';
  }

  return <View style={styles.bm_container}>
    <Text style={styles.bm_content}>
      {status(props.status)}
    </Text>
  </View>
}

export default BatteryMode;