import React, { Component } from "react";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateHslLong } from "d3-interpolate";
import { max, min } from "d3-array";
import { select } from "d3-selection";
import { axisBottom, axisRight } from "d3-axis";

import FileInput from "./FileInput";
import { json } from "d3";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.state = { data: null, images: {} };
  }
  componentDidMount() {
    //this.createBarChart();
  }
  componentDidUpdate() {
    this.createBarChart();
  }

  createBarChart() {
    const node = this.node;

    const xMax = max(this.state.data.map((d) => d.x));
    const xMin = min(this.state.data.map((d) => d.x));
    const xRange = xMax - xMin;
    const xScale = scaleLinear()
      .domain([xMin - xRange / 10, xMax + xRange / 10])
      .range([25, 450]);

    const yMax = max(this.state.data.map((d) => d.y));
    const yMin = min(this.state.data.map((d) => d.y));
    const yRange = yMax - yMin;
    const yScale = scaleLinear()
      .domain([yMin - yRange / 10, yMax + yRange / 10])
      .range([25, 450]);

    const clusterMax = max(this.state.data.map((d) => d.cluster));
    const colorScale = (d) => interpolateHslLong("red", "blue")(d / clusterMax);

    const x_axis = axisBottom().scale(xScale);
    const y_axis = axisRight().scale(yScale);

    select(node).selectAll("text").data(this.state.data).enter().append("text");

    select(node).selectAll("text").data(this.state.data).exit().remove();

    select(node).append("g").call(x_axis);
    select(node).append("g").call(y_axis);

    select(node)
      .selectAll("text")
      .data(this.state.data)
      .style("fill", (d) => colorScale(d.cluster))
      .attr("stroke", "black")
      .attr("stroke-width", ".2px")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      //.attr("r", (d) => yScale(d))
      .attr("font-size", "1em")
      .attr("class", "marker")
      .text((d) => d.class)
      .on("click", (e, d) => {
        select("#chartImageContainer").style("opacity", "1");
        select("#chartImage").attr("src", this.state.images[d.imageURL]);
        console.log(d);
      });
    //.on("mouseout", (e, d) => {
    // select("#chartImageContainer").attr("src", "").style("opacity", "0");
    //});
  }

  processFiles(files) {
    const findImages = new RegExp(".*png", "g");
    let images = files.filter((x) => x.name.match(findImages));

    const findJson = new RegExp(".*json", "g");
    let jsonFiles = files.filter((x) => x.name.match(findJson));

    let fr = new FileReader();

    fr.onload = (e) => {
      var result = JSON.parse(e.target.result);
      console.log(result);

      this.setState({ data: result });
    };

    fr.readAsText(jsonFiles[0]);

    for (let image of images) {
      let fr = new FileReader();

      fr.onload = (e) => {
        let im = this.state.images;
        im[image.name] = e.target.result;
        this.setState({ images: im });
        console.log(this.state.images);
      };

      fr.readAsDataURL(image);
    }

    //console.log(typeof jsonFiles[0]);
  }
  render() {
    if (this.state.data == null) {
      return (
        <FileInput handleSubmit={(e) => this.processFiles(Array.from(e))} />
      );
    } else {
      //console.log(this.state.files);
      return (
        <div
          style={{
            width: "1000px",
            height: "1000px",

            justifyContent: "center",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <svg
            ref={(node) => (this.node = node)}
            width={500}
            height={500}
          ></svg>
          <div
            id="chartImageContainer"
            style={{
              width: "500px",
              height: "500px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <img
              style={{ width: "100%", maxHeight: "100%" }}
              id="chartImage"
              alt="Currently Hovered Spectrogram"
            />
          </div>
        </div>
      );
    }
  }
}

export default Chart;
