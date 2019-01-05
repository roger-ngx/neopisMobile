import React from 'react';
import { PropTypes } from 'prop-types';
import { StyleSheet, View, Text, Image } from 'react-native';

const styles = StyleSheet.create({
  card_title: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    borderBottomColor: 'rgba(184, 184, 194, .3)',
    borderBottomWidth: 1,
    borderStyle: 'solid'

  },
  title_name: {
    color: '#ffffff',
    fontFamily: 'HiraKakuProN-W3',
    fontSize: 20,
    fontWeight: '500',
    alignSelf: 'center'
  },
  title_icon: {
    opacity: 0.7
  }  
})

const CardTitle = (props) =>
  <View style={styles.card_title}>
    <Text style={styles.title_name}>
      {props.title}
    </Text>
    <View styles={styles.title_icon}>
      <Image source={props.image} alt='title icon' />
    </View>
  </View>

CardTitle.propTypes = {
  title: PropTypes.string.isRequired,
  // image: PropTypes.object.isRequired,
}

export default CardTitle;