import React from 'react';
import './CardTitle.scss';
import { PropTypes } from 'prop-types';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card_title: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: 'solid 1px rgba(184, 184, 194, .3)'
  },
  title_name: {
    color: '#ffffff',
    fontFamily: 'HiraKakuProN-W3',
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 0.85,
    letterSpacing: -0.6,
    textSlign: 'center'
  },
  title_icon: {
    opacity: 0.7,
    display: 'table-cell',
  
    img: {
      verticalAlign: 'middle'
    }
  }  
})

const CardTitle = (props) =>
  <div style={styles.card_title}>
    <div style={styles.title_name}>
      {props.title}
    </div>
    <div styles={styles.title_icon}>
      <img src={props.image} alt='title icon' />
    </div>
  </div>

CardTitle.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
}

export default CardTitle;