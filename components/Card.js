import React from 'react';
import { injectIntl } from 'react-intl';
import { StyleSheet, View, Dimensions } from 'react-native';

import { BATTERY_2 } from './CurrentElectricityValue';
import CurrentBatteryPercentage from './CurrentBatteryPercentage';
import CardTitle from './CardTitle';
import BatteryMode from './BatteryMode';
import CurrentElectricityValue from './CurrentElectricityValue';
import DonutChart from './DonutChart';

const itemWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  m_db_card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: itemWidth,
    borderRadius: 5,
    color: '#18161a',
    paddingHorizontal: 27,
    paddingBottom: 32,
  },
  m_db_card_title: {
    alignSelf: 'stretch',
  },
  m_db_card_body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  m_db_card_body_left: {
    height: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  m_db_card_body_right: {
    height: 160,
    display: 'flex',
    justifyContent: 'center'
  }
});

const Card = props => {
  const { intl } = props

  let cardRight;
  if (+props.type === BATTERY_2) {
    cardRight = <>
      <BatteryMode status={props.batteryStatus} />
      <CurrentBatteryPercentage value={props.data.batteryRate} mobile={true} />
    </>
  } else {
    cardRight = <DonutChart type={props.type}
      percentage={props.data.percentage}
      size={112} description={props.description}
      electricity={(props.data.curPower || 0) + 'kW'} />;
  }

  return <View style={styles.m_db_card}>
    <View style={styles.m_db_card_title}>
      <CardTitle title={props.titleName} image={props.titleImage} />
    </View>
    <View style={styles.m_db_card_body}>
      <View style={styles.m_db_card_body_left}>
        <CurrentElectricityValue
          type={props.type} value={props.data.thisMonth}
          unit="MWh" description={intl.formatMessage({ id: 'neopis.thisMonth' })}
          isActive={props.isActive} />

        <CurrentElectricityValue
          type={props.type} value={props.data.today}
          unit="kWh" description={intl.formatMessage({ id: 'neopis.today' })}
          isActive={props.isActive} />
      </View>
      <View style={styles.m_db_card_body_right}>
        {cardRight}
      </View>
    </View>
  </View>
}

export default injectIntl(Card);