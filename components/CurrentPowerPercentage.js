import React, { Component } from 'react';
import { ART } from 'react-native';
import * as d3 from 'd3'
const { Surface, Group, Shape, Text, LinearGradient } = ART

class CurrentPowerPercentage extends Component {

    render() {
        const data = [70, 30];

        const sectionAngles = d3.pie()(data)

        const w = 120;
        const h = 120;
        const r1 = 50;
        const r2 = 60;

        const beginColor = ['#37bad6', '#2d2e2f'],
            endColor = ['#90538', '#2d2e2f'];

        const noOfSeg = sectionAngles.length;

        const linearGradients = [];
        const arcs = [];

        for (let i = 0; i < noOfSeg; i++) {

            const startAngle = sectionAngles[i].startAngle;
            const stopAngle = sectionAngles[i].endAngle;

            const linearGradient = new LinearGradient(
                {
                    '0': beginColor[i],
                    '1': endColor[i]
                },
                r1 * Math.sin(startAngle),
                -r1 * Math.cos(startAngle),
                r1 * Math.sin(stopAngle),
                -r1 * Math.cos(stopAngle)
            )

            linearGradients.push(linearGradient);

            const arc = d3.arc()
                .innerRadius(r1)
                .outerRadius(r2)
                .startAngle(startAngle)
                // Add a fraction of a degree to the end angle so that the arcs overlap 
                // slightly and we don't see the gap caused by antialiasing.
                .endAngle(stopAngle + 0.005)(sectionAngles[i]);

            arcs.push(arc);
        }

        return <Surface width={w} height={h}>
            <Group x={w / 2} y={h / 2}>
                {
                    arcs.map((arc, index) => (
                        <Shape
                            key={index}
                            d={arc}
                            fill={linearGradients[index]}
                        />
                    ))
                }

                <Text font={`23px "Helvetica Neue", "Helvetica", Arial`}
                    fill="#fff"
                    y={-20}
                    alignment="center">
                    100%
                </Text>

                <Text font={`11px "Helvetica Neue", "Helvetica", Arial`}
                    fill="#b8b8c2"
                    y={11}
                    alignment="center">
                    1000kWh
                </Text>
            </Group>
        </Surface>
    }
}


export default CurrentPowerPercentage;