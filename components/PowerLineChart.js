import React, { Component } from 'react';
import { ART, StyleSheet, Dimensions } from 'react-native';
const { Surface, Group, Shape, Text, Path } = ART;
import * as d3 from 'd3';
import { connect } from 'react-redux';

import { chartDataSelector } from '../store/neopisSelectors';

export const ENERGY = 0;
export const BATTERY = 1;
export const ELECTRICITY = 2;

const styles = StyleSheet.create({
    axis: {},
    x: {},
    y: {},
    tick: {},
    line: {}
})

const XAxis = props => {
    const xScale = d3.scaleTime()
        .range([0, props.width]);

    const xAxis = d3.axisBottom(xScale)
        .ticks(Math.max(props.width / 60, 4))
        .tickSize(-props.height);

    xScale.domain([
        d3.min(props.data, c => c.values.length && c.values[0].time),
        d3.max(props.data, function (c) {
            const length = c.values.length;
            return length && c.values[length - 1].time;
        })
    ]);

    const ticks = xAxis.scale().ticks();

    getPaths = () => {
        return (
            new Path()
                .line(0, -props.height)
            //move ctx form current point to relative point
        )
    }

    return <Group style={[styles.x, styles.axis]} y={props.height}>
        {
            ticks.map((tick, i) => <Group key={i} style={styles.tick}
                x={xScale(tick)}>
                <Shape stroke="#525252" strokeWidth={0.5} shapeRendering='crispEdges' d={getPaths()} />
                <Text font={`13px "Helvetica Neue", "Helvetica", Arial`}
                    fill="#525252" x={-15} y={10}>{xScale.tickFormat('%Y')(tick)}</Text>
            </Group>)
        }
    </Group>
}

const YAxis = props => {
    const yScale = d3.scaleLinear()
        .range([props.height, 0]);

    const yAxis = d3.axisLeft(yScale)
        .ticks(Math.max(props.height / 75, 4))
        .tickSize(-props.width)
        .tickFormat("");

    yScale.domain([
        d3.min(props.data, c => d3.min(c.values, v => v.value)),
        d3.max(props.data, c => d3.max(c.values, v => v.value))
    ]);

    const ticks = yAxis.scale().ticks();

    getPaths = () => {
        return (
            new Path()
                .line(props.width, 0)
            //move ctx form current point to relative point
        )
    }

    return <Group style={[styles.y, styles.axis]}>
        {
            ticks.map((tick, i) => <Group key={i} style={styles.tick}
                y={yScale(tick)}>
                <Shape stroke="#525252" strokeWidth={0.5} shapeRendering='crispEdges' d={getPaths()} />
            </Group>)
        }
    </Group>
}

const Line = props => {
    const line = d3.line()
        //.curve(d3.curveCatmullRomOpen)
        .x(d => props.xScale(d.time))
        .y(d => props.yScale(d.value))
        .defined(d => d.value != null);

    return <Group>
        <Shape style={styles.line} d={line(props.data.values)} stroke={props.stroke}></Shape>
    </Group>
}

const Lines = props => {
    const xScale = d3.scaleTime()
        .range([0, props.width]);

    xScale.domain([
        d3.min(props.data, c => c.values.length && c.values[0].time),
        d3.max(props.data, function (c) {
            const length = c.values.length;
            return length && c.values[length - 1].time;
        })
    ]);

    const yScale = d3.scaleLinear()
        .range([props.height, 0]);

    yScale.domain([
        d3.min(props.data, c => d3.min(c.values, v => v.value || 0)),
        d3.max(props.data, c => d3.max(c.values, v => v.value))
    ]);

    return <>
        {props.data.map(
            (data, i) => <Line key={i}
                xScale={xScale}
                yScale={yScale}
                data={data}
                stroke={props.gradients[i]}>
            </Line>)}
    </>
}

const MouseOverEffect = props => {
    var lines = document.getElementsByClassName('line');

    const xScale = d3.scaleTime()
        .range([0, props.width]);

    xScale.domain([
        d3.min(props.data, c => c.values.length && c.values[0].time),
        d3.max(props.data, function (c) {
            const length = c.values.length;
            return length && c.values[length - 1].time;
        })
    ]);

    const yScale = d3.scaleLinear()
        .range([props.height, 0]);

    yScale.domain([
        d3.min(props.data, c => d3.min(c.values, v => v.value || 0)),
        d3.max(props.data, c => d3.max(c.values, v => v.value))
    ]);

    var mousePerLine = d3.select('g').selectAll('.mouse-per-line')
        .data(props.data)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function (d, i) {
            return props.gradients[i];
        })
        .style("fill", "none")
        .style("stroke-width", "2px")
        .style("opacity", "0");


    d3.select('.mouse_area') // append a rect to catch mouse movements on canvas
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.select(".time-value")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.select('.tooltip')
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.select(".time-value")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.select('.tooltip')
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.select(".time-value")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.select('.tooltip')
                .style("opacity", "1");

            var mouse = d3.mouse(this);
            var pos;

            d3.select(".mouse-line")
                .attr("d", function () {
                    var d = "M" + mouse[0] + "," + props.height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            const timeValue = d3.select('.time-value').text(d3.timeFormat("%H:%M")(xScale.invert(mouse[0])))
                .attr('x', mouse[0] - 25)
                .attr('y', props.height + 20);

            var toolTip = d3.select('.tooltip');

            if (mouse[0] > props.width / 2) {
                timeValue.attr("transform", "translate(-30,0)");
                toolTip.attr('transform', `translate(${mouse[0] - 90}, ${mouse[1] - 20})`);
            } else {
                timeValue.attr("transform", "translate(35,0)");
                toolTip.attr('transform', `translate(${mouse[0] + 15}, ${mouse[1] - 20})`);
            }


            d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {

                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    let yValue = yScale.invert(pos.y);
                    if (yValue <= 0) yValue = 0;

                    const text = toolTip.select(`.point-value-${i}`)
                        .text(yValue.toFixed(1))
                        .attr('fill', props.gradients[i]);

                    if (pos.x > props.width / 2) {
                        text.attr("transform", `translate(10,${20 + 20 * i})`);
                    } else {
                        text.attr("transform", `translate(10,${20 + 20 * i})`);
                    }

                    return "translate(" + mouse[0] + "," + pos.y + ")";
                });
        });

    d3.select('.mouse-line')
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    d3.select('.time-value')
        .style("fill", "white")
        .style("opacity", "0");

    d3.select('.tooltip')
        .style("opacity", "0");

    return <g className='mouse-over-effects'>
        <path className="mouse-line"></path>
        <text className='time-value'></text>
        <g className='tooltip'>
            <rect width={80} height={70}
                stroke='#525252'
                opacity='0.5'
                shapeRendering='crispEdges'
                pointerEvents="all"></rect>
            {
                props.gradients.map((g, i) => (
                    <text className={`point-value-${i}`}
                        fontWeight='bold'></text>
                ))
            }
        </g>
        <rect className='mouse_area' width={props.width} height={props.height}
            strokeWidth='0.5px' stroke='#525252'
            shapeRendering='crispEdges' fill="none"
            pointerEvents="all"></rect>
    </g>
}

class PowerLineChart extends Component {

    constructor(props) {
        super(props);
        this.chartArea = React.createRef();
        this.gradients = ['red', 'green', 'blue'];
        this.margin = {
            top: 20,
            right: 20,
            bottom: 25,
            left: 10
        };

        var { height, width } = Dimensions.get('window');

        this.state = {
            width: width - 2 * this.margin.left,
            height: 320,
        };
    }

    componentDidMount() {
        
    }

    render() {

        return <Surface width={this.state.width + 20} height={this.state.height + 100}>
            <Group x={this.margin.left} y={this.margin.top}>

                <XAxis width={this.state.width} height={this.state.height} data={this.props.data} />

                <YAxis width={this.state.width} height={this.state.height} data={this.props.data} />

                <Lines width={this.state.width} height={this.state.height} data={this.props.data} gradients={this.gradients}></Lines>

                {/* <MouseOverEffect width={this.state.width} height={this.state.height} data={this.props.data} gradients={this.gradients} /> */}
            </Group>
        </Surface>
    }
}

const mapStateToProps = state => ({
    data: chartDataSelector(state)
})

export default connect(mapStateToProps)(PowerLineChart);