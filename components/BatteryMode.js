import React from 'react';
import './BatteryMode.scss';
import { StyleSheet } from 'react-native';
export const ABNORMAL = 1, MANUAL = 2, AUTOMATIC = 3;

const styles = StyleSheet.create({
  bm_container: {
    width: 87,
    height: 30,
    borderRadius: 15,
    border: 'solid 1px #7ed321',
    textAlign: 'center',
    margin: 9,
    display: 'table'
  },
  bm_content: {
    fontSize: 12,
    color: '#7ed321',
    display: 'table-cell',
    verticalAlign: 'middle'
  }
})

const BatteryMode = props => {

  let status = (status) => {
    if (status === ABNORMAL) return 'Abnormal';
    if (status === MANUAL) return 'Manual';
    if (status === AUTOMATIC) return 'Automatic';
  }

  return <div style={styles.bm_container}>
    <span style={styles.bm_content}>
      {status(props.status)}
    </span>
  </div>
}

export default BatteryMode;