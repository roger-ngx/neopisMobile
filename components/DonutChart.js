import React, { Component } from 'react';
import * as d3 from 'd3'
import { PropTypes } from 'prop-types';
import { ART, StyleSheet, View } from 'react-native';

import { SOURCE, BATTERY_1, ELECTRICITY } from './CurrentElectricityValue';

const { Surface, Group, Text, Shape } = ART;

const styles = StyleSheet.create({
    card_link: {
        color: 'transparent',
        textDecorationLine: 'none'
    }
})

class DonutChart extends Component {

    constructor(props) {
        super(props);

        switch (props.type) {
            case SOURCE:
                this.colors = ['#ff5742', '#2d2e2f'];
                break;

            case BATTERY_1:
                this.colors = ['#40ca88', '#2d2e2f'];
                break;

            case ELECTRICITY:
                this.colors = ['#338fff', '#2d2e2f'];
                break;

            default:
        }
    }

    render() {
        const data = [this.props.percentage, 100 - this.props.percentage];

        const sectionAngles = d3.pie()(data)

        const w = this.props.size;
        const h = this.props.size;
        const r2 = this.props.size / 2;
        const r1 = r2 - 10;

        const noOfSeg = sectionAngles.length;

        const arcs = [];

        for (let i = 0; i < noOfSeg; i++) {
            const startAngle = sectionAngles[i].startAngle;
            const stopAngle = sectionAngles[i].endAngle;

            const arc = d3.arc()
                .innerRadius(r1)
                .outerRadius(r2)
                .startAngle(startAngle)
                // Add a fraction of a degree to the end angle so that the arcs overlap 
                // slightly and we don't see the gap caused by antialiasing.
                .endAngle(stopAngle + 0.005)(sectionAngles[i]);

            arcs.push(arc);
        }

        const arcElements = arcs.map((arc, index) => <Shape key={index}
            d={arc} fill={this.colors[index]} />);

        return <View onPress={() => LinkingIOS.openURL(`/#/gateways/${props.gwId}/sensors/${props.sensorId}`)}>
            <View style={{ display: 'flex', flexDirection: 'column' }}>
                <View style={{ textAlign: 'center' }}>
                    <Surface width={w} height={h}>
                        <Group x={w / 2} y={h / 2}>
                            {arcElements}

                            <Text font={{ fontFamily: 'HiraKakuProN-W3', fontSize: 26 }}
                                fill='#ffffff'
                                alignment="center"
                                y={-20}>
                                {`${this.props.percentage}%`}
                            </Text>

                            <Text font={{ fontFamily: 'HiraKakuProN-W3', fontSize: 13 }}
                                fill='#b8b8c2'
                                alignment="center"
                                y={10}>
                                {this.props.electricity}
                            </Text>
                        </Group>
                    </Surface>
                </View>
                {/* <Text style={{ color: '#b8b8c2', textAlign: 'center' }}>
                    {this.props.description}
                </Text> */}
            </View>
        </View>
    }
}

DonutChart.propTypes = {
    size: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
    electricity: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
}

export default DonutChart;