/**
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { PagerDotIndicator, IndicatorViewPager } from 'rn-viewpager';
import _ from 'lodash';

import { SOURCE } from '../components/CurrentElectricityValue';
import CurentLocation from '../components/CurrentLocation'
import CurrentWeather from '../components/CurrentWeather';
import CurrentMoment from '../components/CurrentMoment';
import CurrentElectricityValue from '../components/CurrentElectricityValue';
import CurrentPowerPercentage from '../components/CurrentPowerPercentage';
import PowerLineChart from '../components/PowerLineChart'

if(__DEV__) {
  import('../ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: ""
    };
  }

  _renderDotIndicator() {
    return <PagerDotIndicator pageCount={3} />;
  }

  componentDidMount() {
    fetch('https://api.thingplus.net/v2/gateways/080027a081e6', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5MjY5IiwiY2xpZW50SWQiOiJuZW9waXMiLCJpYXQiOjE1NDU3MjAwMjcsImV4cCI6MTU0NzAxNjAyN30.7RBda_sXQuqd_TPbmar-22bdED9ocSYXz43boQLumeM'
      }
    })
    .then(res => res.json())
    .then(res => this.setState({
      location: _.get(res, 'data.location.address', 'Seoul, South Korea')
    }));
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar}>
          <StatusBar />
        </View>
        <View style={styles.currents}>
          <CurrentMoment />
          <CurrentWeather temperature={27} humidity={80} />
          <CurentLocation location={this.state.location} />
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
  statusBar: {
    height: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    backgroundColor: 'white'
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
