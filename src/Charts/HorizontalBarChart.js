import React from "react";
import * as d3 from "d3";
import "./Chart.css"

class HorizontalBarChart extends React.Component {
    constructor(props) {
        super(props)
        this.drawChart = this.drawChart.bind(this);
    }

    componentDidUpdate() {
        this.drawChart(this.props.id, this.props.config, this.props.data)
    }

    /**
    * Draw a Horizontal Bar Chart
    * @param {string} id - name to prefix dom elements 
    * @param {*} config - used to style the chart
    * @param {*} data - used to build the chart
    * 
    * ex. congig = {
    *        margins:{left:1,right:10,top:1,bottom:20},
    *        chart: {title:"United States",subtitle:"Population over Time"},
    *        xAxis:{key:'percent',label:"Percent Population", ticks:5, tickFormat:(d)=>{return d.percent + "%"}},
    *        yAxis:{key:'state',label:"State", ticks:5, tickFormat:(d)=>{return d.name}},
    *        tooltip:{label:(d)=>{return 'label'}}
    *       }
    * ex. data = [
    *        { "name": "Delaware", "percent": 10.4, "color": "#FF0000" },
    *        { "name": "Colorado", "percent": 18.7, "color": "#FFAA00" },
    *        { "name": "Kansas", "percent": 72.8, "color": "#A3FF73" }
    *       ]
    */
    drawChart(id, config, data) {

        if (!id || !config || !data) return

        const chart = d3.select(`#${id}ChartContainer`)

        // Remove older renderings
        chart.selectAll("text").remove()
        chart.select(`#${id}Chart`).selectAll("div").remove()
        chart.select(".svg-container-chart").remove()

        // Title
        chart.select(`#${id}Title`).append("text")
            .text(config.chart.title);

        // Subtitle
        chart.select(`#${id}Subtitle`).append("text")
            .text(config.chart.subtitle);

        chart.transition()

        // This will specify the aspect ratio not the actual size of the chart.
        // The svg is responsive and will scale to fill parent.
        const width = 480,
            height = 400,
            opacityHover = 1,
            otherOpacityOnHover = .8;

        // Define x and y type and scales
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([height, 0]);

        // Determine domain 
        const max = data.map(d => { return d[config.xAxis.key] }).sort(function (a, b) { return a - b; })[data.length - 1]
        x.domain([0, max]);
        y.domain(data.map(function (d) { return d.Risk; })).padding(0.1);

        // Create the x-axis
        const xAxis = d3.axisBottom(x)
            .ticks(config.xAxis.ticks)
            .tickFormat(config.xAxis.tickFormat)

        // Create the y-axis
        const yAxis = d3.axisLeft(y)
            .ticks(config.yAxis.ticks)
            .tickFormat(config.yAxis.tickFormat)

        // Create a responsive svg element
        const svg = chart.select(`#${id}Chart`)
            .append("div")
            .classed("svg-container-chart", true)
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + (width + config.margins.left + config.margins.right) + " " + (height + config.margins.top + config.margins.bottom))
            .classed("svg-content-responsive", true)
            .attr("version", "1.1")
            .attr("baseProfile", "full")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .append("g")
            .attr("transform", "translate(" + config.margins.left + "," + 0 + ")");

        // Add the x-axis to the svg
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("font-size", "11px")
            .call(xAxis);

        // Add the y-axis to the svg
        svg.append("g")
            .attr("transform", "translate(" + -1 + "," + 0 + ")")
            .attr("class", "y axis")
            .attr("font-size", "11px")
            .call(yAxis);

        // Add the horizontal bars
        const bars = svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("height", y.bandwidth())
            .attr("fill", function (d) { return d.color })
            .attr("y", function (d) { return y(d[config.yAxis.key]); })
            .attr("width", function (d) { return x(d[config.xAxis.key]); });

        // Add a div inside chart for tooltips
        const tooltip = chart.select(`#${id}Chart`)
            .append("div")
            .attr("class", "chartTooltip")
            .style("opacity", 0);

        // Add tooltip functionality on mouseOver
        bars.on("mouseover", function (d) {
            d3.selectAll('rect')
                .style("opacity", otherOpacityOnHover);
            d3.select(this)
                .style("opacity", opacityHover);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(config.tooltip.label(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("border", `3px solid ${d.color}`);
        });

        // Add tooltip functionality on mouseOut
        bars.on("mouseout", function (d) {
            d3.selectAll('rect')
                .style("opacity", opacityHover);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        // Add a label for the x-axis.
        svg.append("g")
            .append("text")
            .attr("y", height + config.margins.top + 25)
            .attr("x", width / 2)
            .attr("fill", "rgb(0, 0, 0)")
            .attr("font-size", "14px")
            .style("text-anchor", "middle")
            .text(config.xAxis.label);

        // Add a label for the y-axis.
        svg.append("g")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - config.margins.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("fill", "rgb(0, 0, 0)")
            .attr("font-size", "14px")
            .style("text-anchor", "middle")
            .text(config.yAxis.label);
    }

    render() {
        const divs = () => {
            if (this.props.data) {
                const id = this.props.id
                return (
                    <div>
                        <div id={id + 'ChartContainer'} className="chart-container">
                            <div id={id + 'Title'} className="title"></div>
                            <div id={id + 'Subtitle'} className="subtitle"></div>
                            <div id={id + 'Chart'} className="chart"></div>
                        </div>
                    </div>
                );
            }
        }
        return (
            <div>
                {divs()}
            </div>
        );
    }
}
export default HorizontalBarChart;