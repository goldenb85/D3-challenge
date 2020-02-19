var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select scatter, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);
// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Store the chart data
var newsData = null;  
// Default initial x-axis label
var chosenXAxis = "poverty";  


// function used for x-scale var upon click on axis label text
function xScale(newsData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
        d3.max(newsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }


// function used for updating circles group with a transition to
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup,) {

    if (chosenXAxis === "poverty") {
      var label = "In Poverty:";
    }
    else {
        var label = "Age (Median):";
    }
    
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }


// function initialize the chart elements
// Load data from data.csv

d3.csv("../StarterCode/assets/data/data.csv").then(function(newsData, err) {
        if (err) throw err;
      
        // parse data
        newsData.forEach(function(data) {
          data.poverty = +data.poverty;
          data.healthcare = +data.healthcare;
          data.age = +data.age;
        });
      
        // xLinearScale function above csv import
        var xLinearScale = xScale(newsData, chosenXAxis);
      
        // Create y scale function
        var yLinearScale = d3.scaleLinear()
          .domain([0, d3.max(newsData, d => d.healthcare)])
          .range([height, 0]);
      
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
      
        // append x axis
        var xAxis = chartGroup.append("g")
          .classed("x-axis", true)
          .attr("transform", `translate(0, ${height})`)
          .call(bottomAxis);
      
        // append y axis
        chartGroup.append("g")
          .call(leftAxis);
      
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
          .data(newsData)
          .enter()
          .append("circle")
          .attr("cx", d => xLinearScale(d[chosenXAxis]))
          .attr("cy", d => yLinearScale(d.healthcare))
          .attr("r", 20)
          .attr("fill", "pink")
          .attr("opacity", ".5");
         // Create the text for each circle

        // Create group for  2 x- axis labels
        var labelsGroup = chartGroup.append("g")
          .attr("transform", `translate(${width / 2}, ${height + 20})`);
      
        var povertyLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("value", "poverty") // value to grab for event listener
          .classed("active", true)
          .text("In Poverty (%)");
      
        var ageLabel = labelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 40)
          .attr("value", "age") // value to grab for event listener
          .classed("inactive", true)
          .text("Age (Median)");
      
        // append y axis
        chartGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .classed("axis-text", true)
          .text("Lacks Healthcare(%)");
      
        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
      
        // x axis labels event listener
        labelsGroup.selectAll("text")
          .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
      
              // replaces chosenXAxis with value
              chosenXAxis = value;
      
              // console.log(chosenXAxis)
      
              // functions here found above csv import
              // updates x scale for new data
              xLinearScale = xScale(newsData, chosenXAxis);
      
              // updates x axis with transition
              xAxis = renderAxes(xLinearScale, xAxis);
      
              // updates circles with new x values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
      
              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
      
              // changes classes to change bold text
              if (chosenXAxis === "poverty") {
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
            }
          });
      }).catch(function(error) {
        console.log(error);
      });
      