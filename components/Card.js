import React from 'react';
import { injectIntl } from 'react-intl';
import { StyleSheet } from 'react-native';

import { BATTERY_2 } from './CurrentElectricityValue';
import CurrentBatteryPercentage from './CurrentBatteryPercentage';
import CardTitle from './CardTitle/CardTitle';
import BatteryMode from './BatteryMode/BatteryMode';
import CurrentElectricityValue from './CurrentElectricityValue';
import DonutChart from './DonutChart';

const styles = StyleSheet.create({
  m_db_card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 5,
    color: '#18161a',
    margin: '10px 40px 0',
    padding: '15px 27px 32px'
  },
  m_db_card_title: {
    flex: 1
  },
  m_db_card_body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20
  },
  m_db_card_body_left: {
    height: 140,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  m_db_card_body_right: {
    height: 140
  }
});

const CardMobile = props => {
  const { intl } = props

  let cardRight;
  if (+props.type === BATTERY_2) {
    cardRight = <>
      <BatteryMode status={props.batteryStatus} />
      <CurrentBatteryPercentage value={props.data.batteryRate} mobile={true} />;
    </>
  } else {
    cardRight = <DonutChart type={props.type}
      percentage={props.data.percentage}
      size={112} description={props.description}
      electricity={(props.data.curPower || 0) + 'kW'} />;
  }

  return <div style={styles.m_db_card}>
    <div style={styles.m_db_card_title}>
      <CardTitle title={props.titleName} image={props.titleImage} />
    </div>
    <div style={styles.m_db_card_body}>
      <div style={styles.m_db_card_body_left}>
        <CurrentElectricityValue
          type={props.type} value={props.data.thisMonth}
          unit="MWh" description={intl.formatMessage({ id: 'neopis.thisMonth' })}
          isActive={props.isActive} />

        <CurrentElectricityValue
          type={props.type} value={props.data.today}
          unit="kWh" description={intl.formatMessage({ id: 'neopis.today' })}
          isActive={props.isActive} />
      </div>
      <div style={styles.m_db_card_body_right}>
        {cardRight}
      </div>
    </div>
  </div>
}

export default injectIntl(CardMobile);