import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import image from '../assets/images/location.png';
import { StyleSheet, View, Text, Image } from 'react-native';

const style = StyleSheet.create({
  m_location: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center'
  },
  m_location_icon: {
    width: 22,
    height: 31
  },
  m_location_address: {
    fontSize: 12,
    marginTop: 8,
    letterSpacing: -1,
    color: '#fff',
    textAlign: 'center'
  }
})

const CurrentLocation = props =>
  <View style={style.m_location}>
    <Image source={image} style={style.m_location_icon} alt='location icon' />
    <Text style={style.m_location_address}>{props.location}</Text>
  </View>

CurrentLocation.propTypes = {
  location: PropTypes.string
}

const mapStateToProps = state => ({
  location: state.location
})

export default connect(mapStateToProps)(CurrentLocation);