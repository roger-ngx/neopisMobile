import React from 'react';
import { PropTypes } from 'prop-types';
import { StyleSheet } from 'react-native';

import './CurrentBatteryPercentage.scss'

const styles = StyleSheet.create({
  m_battery: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100,
    alignItems: 'center'
  },
  battery_info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  battery_image: {
    width: 97,
    height: 41,
    borderRadius: 2,
    color: '#2e2d2f'
  },
  battery_value: {
    fontFamily: 'HiraKakuProN-W3',
    fontSize: 20,
    color: '#ebecec'
  },
  battery_label: {
    marginTop: 'auto',
    fontFamily: 'HiraKakuProN-W3',
    fontSize: 12,
    letterSpacing: -0.5,
    color: '#b8b8c2'
  }
})

const CurrentBatteryPercentage = props => {

  return <a style={styles.card_link} href={`/#/gateways/${props.gwId}/sensors/${props.sensorId}`}>
    <div style={styles.m_battery}>
      <div style={styles.battery_image}>
        <div style={styles.battery_volumn}>
        </div>
      </div>
      <div style={styles.battery_info}>
        <div style={styles.battery_value}>
          <span>{props.value}%</span>
        </div>
        <div style={styles.battery_label}>
          <span>배터리량</span>
        </div>
      </div>
    </div>
  </a>
}

CurrentBatteryPercentage.propTypes = {
  mobile: PropTypes.bool,
  value: PropTypes.number.isRequired
}

CurrentBatteryPercentage.defaultProps = {
  mobile: false
}

export default CurrentBatteryPercentage;