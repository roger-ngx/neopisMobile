import React, { Component } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import image from '../images/time.png'
import moment from 'moment';
import 'moment/locale/ko';

const style = StyleSheet.create({
    m_current_moment: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
      }, 
      m_current_icon : {
        marginTop: 3,
        width: 27,
        height: 28,
      },
      m_current_date : {
        fontSize: 9,
        marginTop: 5,
        letterSpacing: -0.5,
        textAlign: 'center',
        color: '#9e9ea5'
      },
      m_current_time : {
        marginTop: 11,
        fontSize: 14,
        letterSpacing: -0.4,
        textAlign: 'center',
        color: '#ffffff'
      }
});

class CurrentMoment extends Component {
  constructor(props) {
    super(props);
    moment.locale('kr');

    this.state = {
      date: '', 
      time: ''
    }
  }

  componentDidMount() {
    setInterval(() => {
      const [date, time] = moment().format('YYYY / MM / DD / dddd,HH:mm:ss').split(',');
      this.setState({date, time})
    }, 1000);
  }

  render() {
    return <View style={style.m_current_moment}>
      <Image style={style.m_current_icon} source={image} alt='time icon' />
      <Text style={style.m_current_time}>
        {this.state.time}
      </Text>
      <Text style={style.m_current_date}>
        {this.state.date}
      </Text>
    </View>
  }
}

export default CurrentMoment;