import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const SOURCE = 1;
export const BATTERY_1 = 2;
export const BATTERY_2 = 3;
export const ELECTRICITY = 4;

const CurrentElectricityValue = (props) => {
    const separatorStyle = [style.m_ev_separator,
    !props.isActive && style.gbg_deactive];

    const linearColors = type => {
        switch (type) {
            case SOURCE:
                return ['#ffae33', '#ff009e'];

            case BATTERY_1:
                return ['#338fff', '#42e27f', '#ffea9a'];

            case BATTERY_2:
                return ['#ffea9a', '#42e27f', '#338fff'];

            case ELECTRICITY:
                return ['#3023ae', '#c86dd7'];
        }
    };

    return <View style={style.m_electricity_value}>
        <View style={style.m_ev_value_unit}>
            <Text style={style.m_ev_value}>
                {props.value}
            </Text>
            <Text style={style.m_ev_unit}>
                {props.unit}
            </Text>
        </View>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={linearColors(+props.type)}
            style={separatorStyle}>
        </LinearGradient>
        <Text style={style.m_ev_description}>
            {props.description}
        </Text>
    </View>
}

const style = StyleSheet.create({
    m_electricity_value: {
        flex: 0,
        flexDirection: 'column',
        alignItems: 'center',
        width: 120,
        padding: 0
    },
    m_ev_value_unit: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        alignContent: 'center'
    },
    m_ev_value: {
        fontSize: 23,
        lineHeight: 23 * 1.2,
        height: 23,
        color: '#ffffff'
    },
    m_ev_unit: {
        fontSize: 10,
        lineHeight: 10 * 1.2,
        height: 10,
        color: '#ffffff'
    },
    m_ev_separator: {
        height: 4,
        borderRadius: 3,
        width: 100,
        marginTop: 6
    },
    m_ev_description: {
        paddingTop: 9,
        fontSize: 11,
        color: '#ffffff'
    },
    gbg_deactive: {
        backgroundColor: 'grey'
    },
    gbg_source: {
        backgroundColor: '#ffae33'
    },
    gbg_battery_1: {
        backgroundColor: '#338fff'
    },
    gbg_battery_2: {
        backgroundColor: '#30e9c9'
    },
    gbg_electricity: {
        backgroundColor: '#3023ae'
    }
});

export default CurrentElectricityValue;