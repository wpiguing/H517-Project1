// Horizontal Bar Graph
function RenderDeathBarGraph(data) {

    w = 1000;
    h = 500;
    var padding = 50; 
    var barHeight = h / data.length;
    var padding = 50;

    // Parse Date format
    var dateFormat  = d3.timeFormat("%b %d");
    var parseDate  = d3.timeParse("%-d-%b");
    data.forEach(function(d) {
    d.date = parseDate(d.date);
    });

    let barSvg = d3.select("#day-bar-graph")
        .append("svg")
        .attr("id", "bar-svg")
        .attr("width", w + padding)
        .attr("height", h + padding );
    
    // Scale
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.deaths; })])
        .range([0, w ]);
    var yScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        //.range([0, h + barHeight]);
    
    // Bars
    barSvg.append("g")
        .attr("class", "bars")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "red")
        .attr("y", function(d, i) { 
            return i * barHeight ; 
        })
        .attr("height", barHeight)
        
        .attr("x", padding )
        .attr("width", function(d) { 
            return xScale(d.deaths) ; 
        })

    // Death Value Labels - only for values > 10
    barSvg.append("g")
        .attr("class", "bar-labels")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            if (d.deaths > 5 ){
                return (d.deaths)
            } else return;
        })
        .attr("x", function(d) { 
                return xScale(d.deaths) 
            
        })
        .attr("y", function(d, i) {
            return i * barHeight + 11 ; 
        });
        

    //
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(data.length)
        .tickSizeOuter(0);

    //y axis
    barSvg.append("g")
        .attr("class", "y-Axis")
        .call(yAxis)
        .selectAll("text")
        .text( function(d){
            return dateFormat(d)
        })
        .style("font-size", "10px")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", "1em")
        //.attr("transform", "rotate(-90)")
        .attr("transform", function(d, i) { 
            return "translate(50, " + (i * barHeight) + ")"
        });

    
    }

// Vertical Bar Graph
function RenderDeathBarGraph(data){
    w = 1200;
    h = 500;
    var padding = 50; 
    
    // Parse Date format
    var dateFormat  = d3.timeFormat("%b %d");
    var parseDate  = d3.timeParse("%-d-%b");
    data.forEach(function(d) {
    d.date = parseDate(d.date);
    });

    let barSvg = d3.select("#day-bar-graph")
        .append("svg")
        .attr("id", "bar-svg")
        .attr("width", w + padding)
        .attr("height", h + padding );
    
    
    // Scales
     var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, w ]);
     var yMax = d3.max(data, function(d){return +d.deaths;});
     var yScale = d3.scaleLinear()
        .domain([yMax, 0 ])
        .range([padding , h]);

    // Bars
    barSvg.append("g")
        .attr("class", "bars")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "red")
        .attr("x", function (d, i){
            return i * (w / data.length);
        })
        .attr("y", function (d){
            // return (h - padding) + yScale(d.deaths) ;
            //return  yScale(d.deaths);
            return yScale(d.deaths);
        })
            .attr("width", w / data.length)
        .attr("height", function (d){
            return h + yScale(d.deaths) ;
     
        })

    // Death Value Labels - only for values > 10
    barSvg.append("g")
    .attr("class", "bar-labels")
    .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return d.deaths;
        })
        .attr("x", function(d, i) {
            if (d.deaths> 10) {
                return i * (w / data.length);
            }
        })
        .attr("y", function(d) {
            if (d.deaths> 10) {
                return padding + yScale(d.deaths);
            }
        });
    // Axis
    var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5);
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(20);

    // x axis
    barSvg.append("g")
        .attr("class", "x-Axis")
        .attr("transform", "translate(0," + (w / data.length) + ")")
        .call(xAxis)
        .selectAll("text")
        .text( function(d){
            return dateFormat(d)
        })
        .style("text-anchor", "end")
        .attr("dx", "-1.8em")
        .attr("dy", "0em")
        .attr("transform", "rotate(-90)");

    //y axis
    barSvg.append("g")
        .attr("class", "y-Axis")
        .call(yAxis)
        .attr("transform", "translate(" + (padding) + ", 0)")

};