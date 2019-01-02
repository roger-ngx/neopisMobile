import React from 'react';
import image from '../images/weather.png'
import { PropTypes } from 'prop-types';
import { View, Image, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

const style = StyleSheet.create({
    m_weather: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    m_weather_icon: {
        width: 37,
        height: 32,
    },
    m_weather_temperature: {
        marginTop: 8,
        fontSize: 16,
        letterSpacing: -0.5,
        textAlign: 'center',
        color: '#ffffff'
    },
    m_weather_humidity: {
        marginTop: 4,
        fontSize: 10,
        letterSpacing: -0.3,
        textAlign: 'center',
        color: '#9e9ea5'
    }
});

const CurrentWeather = props => {
    return <View style={style.m_weather}>
        <Image source={image} style={style.m_weather_icon} alt='weather icon' />
        <Text style={style.m_weather_temperature}>{props.temperature}°C</Text>
        <Text style={style.m_weather_humidity}>{props.humidity}%</Text>
    </View>
}

CurrentWeather.propTypes = {
    temperature: PropTypes.number,
    humidity: PropTypes.number
}

const mapStateToProps = state => ({
    temperature: state.weather.temperature,
    humidity: state.weather.humidity
})

export default connect(mapStateToProps)(CurrentWeather);