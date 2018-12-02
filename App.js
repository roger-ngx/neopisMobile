/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, ViewPagerAndroid } from 'react-native';
import CurentLocation from './components/CurrentLocation'
import CurrentWeather from './components/CurrentWeather';
import CurrentMoment from './components/CurrentMoment';
import { PagerDotIndicator, IndicatorViewPager } from 'rn-viewpager';


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
            <Text>page one</Text>
          </View>
          <View style={styles.pageStyle}>
            <Text>page two</Text>
          </View>
        </IndicatorViewPager>
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
  viewPager: {
    height: 200,
    alignSelf: "stretch",
    marginTop: 20,
  },
  pageStyle: {
    backgroundColor: 'cadetblue',
    padding: 20
  }
});
