/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { PagerDotIndicator, IndicatorViewPager } from 'rn-viewpager';

import { SOURCE } from './components/CurrentElectricityValue';
import CurentLocation from './components/CurrentLocation'
import CurrentWeather from './components/CurrentWeather';
import CurrentMoment from './components/CurrentMoment';
import CurrentElectricityValue from './components/CurrentElectricityValue';
import CurrentPowerPercentage from './components/CurrentPowerPercentage';
import PowerLineChart from './components/PowerLineChart'


export default class App extends Component {
  _renderDotIndicator() {
    return <PagerDotIndicator pageCount={2} />;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.currents}>
          <CurrentMoment />
          <CurrentWeather temperature={27} humidity={80} />
          <CurentLocation location='해오름 1호 태양광 발전소' />
        </View>

        <IndicatorViewPager
          style={styles.viewPager}
          indicator={this._renderDotIndicator()}>
          <View style={styles.pageStyle}>
            <View style={styles.electricValues}>
              <CurrentElectricityValue type={SOURCE} value='3456.7' unit='MWh' description='This month' />
              <CurrentElectricityValue type={SOURCE} value='9821.3' unit='kWh' description='Today' />
            </View>
            <View style={styles.electricValues}>
              <CurrentPowerPercentage />
            </View>
          </View>
        </IndicatorViewPager>

        <View style={styles.chart}>
          <PowerLineChart />
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0d0f',
  },
  currents: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 71,
  },
  chart: {
    flex: 1
  },
  viewPager: {
    height: 200,
    alignSelf: "stretch",
    marginTop: 20,
  },
  pageStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#18161a',
    paddingVertical: 10,
    paddingHorizontal: 40
  },
  electricValues: {
    flex: 0,
    justifyContent: 'space-evenly',
    backgroundColor: '#18161a'
  }
});
