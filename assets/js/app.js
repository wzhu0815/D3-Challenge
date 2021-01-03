// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg
  .append("g")
  .attr("class", "chart")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d[chosenXAxis]) * 0.9,
      d3.max(stateData, (d) => d[chosenXAxis]) * 1.1,
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d[chosenYAxis]) * 0.9,
      d3.max(stateData, (d) => d[chosenYAxis]) * 1.1,
    ])
    .range([height, 0]);

  return yLinearScale;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, stateLabel) {
  var toolTip = d3.tip().attr("class", "d3-tip").offset([-10, 0]);
  if (chosenXAxis === xList[1]) {
    toolTip = toolTip.html(function (d) {
      return `${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`;
    });
  } else if (chosenXAxis === xList[2]) {
    toolTip = toolTip.html(function (d) {
      return `${d.state}<br>${chosenXAxis}: $${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`;
    });
  } else {
    toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function (d) {
        return `${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`;
      });
  }

  stateLabel.call(toolTip);

  stateLabel
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function (data) {
      toolTip.hide(data);
    });

  return stateLabel;
}

// function used for updating Axis var upon click on axis label
function renderX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(500).call(bottomAxis);

  return xAxis;
}
function renderY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(500).call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(500)
    .attr("cx", (d) => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup
    .transition()
    .duration(500)
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

var xList = ["poverty", "age", "income"];
var yList = ["healthcare", "smokes", "obesity"];

var chosenXAxis = xList[0];
var chosenYAxis = yList[0];

// Retrieve data from the CSV file and execute everything below

d3.csv("assets/data/data.csv").then(function (stateData, err) {
  if (err) throw err;
  // parse data
  stateData.forEach((data) => {
    // data for xAxis
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    // data for the yAxis
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });
  console.log(stateData[0]);
  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);
  // xLinearScale function above csv import
  var yLinearScale = yScale(stateData, chosenYAxis);
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // append x axis
  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  yAxis = chartGroup.append("g").call(leftAxis);
  // append initial circles
  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
    .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("opacity", ".7");

  var stateLabel = chartGroup
    .append("g")
    .selectAll("text")
    .data(stateData)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .attr("x", (d) => xLinearScale(d[chosenXAxis]))
    .attr("y", (d) => yLinearScale(d[chosenYAxis]))
    // https://observablehq.com/@bryik/centering-text-inside-a-circle
    .attr("alignment-baseline", "central")
    .text((d) => d["abbr"]);

  stateLabel = updateToolTip(chosenXAxis, chosenYAxis, stateLabel);

  var labelsGroupX = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var provertyLabel = labelsGroupX
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", xList[0]) // value to grab for event listener
    .classed("active", true)
    .text("In Provery (%)");

  var ageLabel = labelsGroupX
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", xList[1]) // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroupX
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", xList[2]) // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var labelsGroupY = chartGroup
    .append("g")
    .attr(
      "transform",
      `rotate(-90) translate (${0 - height / 2},${0 - margin.left / 3})`
    );
  var healthLabel = labelsGroupY
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", yList[0]) // value to grab for event listener
    .classed("active", true)
    .text("Lacks HealthCare (%)");

  var smokeLabel = labelsGroupY
    .append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", yList[1]) // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = labelsGroupY
    .append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", yList[2]) // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%)");
  var xLabels = [provertyLabel, ageLabel, incomeLabel];
  var yLabels = [healthLabel, smokeLabel, obeseLabel];

  var chosenDataX = stateData.map((d) => d[chosenXAxis]);
  console.log(chosenDataX);
  var chosenDataY = stateData.map((d) => d[chosenYAxis]);
  console.log(chosenDataY);

  // x axis labels event listener
  labelsGroupX.selectAll("text").on("click", function () {
    // get value of selection
    var valueX = d3.select(this).attr("value");
    if (valueX !== chosenXAxis) {
      chosenXAxis = valueX;
      xLinearScale = xScale(stateData, chosenXAxis);
      xAxis = renderX(xLinearScale, xAxis);
      circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
      stateLabel
        .attr("x", (d) => xLinearScale(d[chosenXAxis]))
        .attr("y", (d) => yLinearScale(d[chosenYAxis]));
      stateLabel = updateToolTip(chosenXAxis, chosenYAxis, stateLabel);
    } else {
    }
    xLabels.forEach((d) => {
      d.classed("inactive", true).classed("active", false);
    });
    for (i = 0; i < xList.length; i++) {
      if (chosenXAxis === xList[i]) {
        xLabels[i].classed("active", true).classed("inactive", false);
      } else {
      }
    }
  });
  // y axis labels event listener
  labelsGroupY.selectAll("text").on("click", function () {
    // get value of selection
    var valueY = d3.select(this).attr("value");
    if (valueY !== chosenYAxis) {
      chosenYAxis = valueY;
      yLinearScale = yScale(stateData, chosenYAxis);
      yAxis = renderY(yLinearScale, yAxis);
      circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
      stateLabel
        .attr("x", (d) => xLinearScale(d[chosenXAxis]))
        .attr("y", (d) => yLinearScale(d[chosenYAxis]));
      stateLabel = updateToolTip(chosenXAxis, chosenYAxis, stateLabel);
    } else {
    }
    yLabels.forEach((d) => {
      d.classed("inactive", true).classed("active", false);
    });
    for (j = 0; j < yList.length; j++) {
      if (chosenYAxis === yList[j]) {
        yLabels[j].classed("active", true).classed("inactive", false);
      } else {
      }
    }
    var chosenDataY = stateData.map((d) => d[chosenYAxis]);
    console.log(chosenDataY);
  });

  // **********************
});

// makeResponsive();

// // Event listener for window resize.
// // When the browser window is resized, makeResponsive() is called.
// d3.select(window).on("resize", makeResponsive);
