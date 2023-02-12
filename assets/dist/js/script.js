document.addEventListener('DOMContentLoaded', function () {
    var w = 500;
    var h = 500;
    const multiplier = 25;
    const radius = 2;

    let svg = d3.select("#canvas")
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", w)
        .attr("height", h);

    // var zoom = d3.zoom()
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoomed);

    // svg.call(zoom);

    // function zoomed() {
    //     g.attr("transform", d3.event.transform);
    // }

    //Streets Map 

    LoadAllData();

    function LoadAllData() {
        d3.json("./data/streets.json").then(function (data) {
            RenderStreets(data);
        });
        d3.csv("./data/deathdays.csv").then(function (data) {
            RenderDeathBarGraph(data);
        });
        d3.csv("./data/pumps.csv").then(function (data) {
            RenderPumps(data);
        });
        d3.csv("./data/deaths_age_sex.csv").then(function (data) {
            // Create argumnet arrays from data 
            var genderPieData = new Array(2).fill(0);
            var agePieData = {
                zero: 0,
                one: 0,
                two: 0,
                three: 0,
                four: 0,
                five: 0
            }
            data.forEach(i => {
                switch (i.gender) {
                    case "0":
                        genderPieData[0] += 1; // male
                        break;
                    case "1":
                        genderPieData[1] += 1; // female
                        break;
                    default:
                        break;
                }
                switch (i.age) {
                    case "0":
                        agePieData.zero += 1; // <= 10
                        break;
                    case "1":
                        agePieData.one += 1; // >= 11 &&  <=20
                        break;
                    case "2":
                        agePieData.two += 1; // >= 21 && i.age <=40
                        break;
                    case "3":
                        agePieData.three += 1; // >= 41 && <=60
                        break;
                    case "4":
                        agePieData.four += 1; //  >= 61 &&  <=80
                        break;
                    case "5":
                        agePieData.five += 1; // > 80 
                        break;
                    default:
                        break;
                }
            });

            // Pass "massaged" data to render death circles, gender, and age charts and 
            RenderDeathCircles(data);
            RenderGenderPieChart(genderPieData);
            RenderAgePieChart(agePieData);
        });
    }

    function RenderStreets(data) {
        var streets = [];
        var street = [];
        street = data.map(function (d) {
            street = [];
            street.push(d[0].x, d[0].y, d[1].x, d[1].y);
            if (d[2] != null) {
                street.push(d[2].x, d[2].y);
            }
            streets.push(street);
        });

        var g = d3.select("#map-svg")
            .append("g")
            .attr("id", "streets");

        var lines = g.selectAll("line")
            .data(streets)
            .enter()
            .append("line");

        g.append("path")
            .data([streets])
            .enter().append("path")
            .attr("class", "line")
            .attr("d", lines);


        lines.style("stroke", "black")
            .style("stroke-width", 1)
            .attr("x1", function (d) {
                return d[0] * multiplier
            })
            .attr("y1", function (d) {
                return d[1] * multiplier
            })
            .attr("x2", function (d) {
                return d[2] * multiplier
            })
            .attr("y2", function (d) {
                return d[3] * multiplier
            });
    }

    function RenderPumps(data) {
        var g = d3.select("#map-svg")
            .append("g")
            .attr("id", "pumps");
        var pumps = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        pumps.attr("cx", function (d) {
                return d.x * 25;
            })
            .attr("cy", function (d) {
                return d.y * 25;
            })
            .attr("r", function (d) {
                return radius * 2;
            })
            .attr("fill", "red");
    }

    function RenderDeathCircles(data) {
        var g = d3.select("#map-svg")
            .append("g")
            .attr("id", "cirles");
        var circles = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")

        circles.attr("cx", function (d) {
                return d.x * 25;
            })
            .attr("cy", function (d) {
                return d.y * 25;
            })
            .attr("r", function (d) {
                return radius;
            })
            .attr("data-age", function (d) {
                return d.age;
            })
            .attr("data-gender", function (d) {
                return d.gender;
            })
            .attr("fill", function (d) {
                if (d.gender == 1) {
                    return "pink";
                } else {
                    return "blue";
                }
            })
            .attr("class", function (d) {
                if (d.gender == 1) {
                    return "female";
                } else {
                    return "male";
                }
            });
    }

    function RenderGenderPieChart(pieData) {
        w = 200;
        h = 200;
        let pieSvg = d3.select("#pie-chart")
            .append("svg")
            .attr("id", "pie-svg")
            .attr("width", w)
            .attr("height", h);

        pieSvg = d3.select("#pie-svg"),
            width = pieSvg.attr("width"),
            height = pieSvg.attr("height"),
            pieRadius = Math.min(width, height) / 2,
            g = pieSvg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(['#0000FF', '#FFC0CB']);
        var pie = d3.pie();
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var arcs = g.selectAll("arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc")

        arcs.append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc);
        arcs.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .text(function (d) {
                if (d.index == 1) {
                    return "Male - " + d.value;
                } else {
                    return "Female - " + d.value;
                }
            });
    }

    function RenderAgePieChart(agePieData) {
        w = 200;
        h = 200;
        let agePieSvg = d3.select("#age-pie-chart")
            .append("svg")
            .attr("id", "age-pie-svg")
            .attr("width", w)
            .attr("height", h);

        agePieSvg = d3.select("#age-pie-svg"),
            width = agePieSvg.attr("width"),
            height = agePieSvg.attr("height"),
            pieRadius = Math.min(width, height) / 2,
            g = agePieSvg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c', '#00B3D4']);
        var pie = d3.pie();
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var arcs = g.selectAll("arc")
            .data(pie(Object.values(agePieData)))
            .enter()
            .append("g")
            .attr("class", "arc")

        arcs.append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc);
        arcs.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .text(function (d) {
                return GetRangeLabel(agePieData, d.value);
            });
    }

    function GetRangeLabel(genderPieData, value) {
        var range = Object.keys(genderPieData).find(key => genderPieData[key] === value);
        switch (range) {
            case "zero":
                return "0-10";
            case "one":
                return "11-20";
            case "two":
                return "21-40";
            case "three":
                return "41-60";
            case "four":
                return "61-80";
            case "five":
                return "> 80";
            default:
                return;
        }
    }

    function RenderDeathBarGraph(data) {

    w = 1200;
    h = 350;
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
        .attr("height", h + padding);

    // Scales
     var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, w ]);
     var yMax = d3.max(data, function(d){return +d.deaths;});
     var yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([0 , h]);

    // For the Y Axis and Bar Value labels. Domain was a pain in the ass to invert, so just give those two their own scale.  
    var invertedYScale = d3.scaleLinear()
        .domain([yMax, 0])
        .range([0 , h]); 
    
    // Added a color scale for bars
    var color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(data, function(d) { return d.deaths; })]);

    // Bars
    barSvg.append("g")
        .attr("class", "bars")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", function(d) { 
            return color(d.deaths); 
        })
        .attr("x", function (d, i){
            return i * (w / data.length) + padding;
        })
        .attr("width", w / data.length)
        .attr("y", function (d){
            return h - yScale(d.deaths);
        })
        .attr("height", function (d){
            return yScale(d.deaths) ;
        })

    // Death Value Labels - only for values > 10
    barSvg.append("g")
        .attr("class", "bar-labels")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("data-death-value", function(d){
            return d.deaths;
        })
        .text(function(d) {
            if (d.deaths> 20) { return d.deaths; }
        } )
        .attr("x", function(d, i) {
                return i * (w / data.length) + padding + 13;
        })
        .attr("y", function(d) {
            if (d.deaths> 10) {
                return  invertedYScale(d.deaths) + padding;
            }
        })
        .attr("text-anchor", "middle")
        .attr("fill", "white");


    // Axis
    var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(data.length);
    var yAxis = d3.axisLeft()
        .scale(invertedYScale)
        .ticks(20);

    // x axis
    barSvg.append("g")
        .attr("class", "x-Axis")
        .attr("transform", "translate(" + padding  + "," +  h + ")")
        .call(xAxis)
        .selectAll("text")
        .text( function(d){
            return dateFormat(d)
        })
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", "-.8em")
        .attr("transform", "rotate(-90)");

    //y axis
    barSvg.append("g")
        .attr("class", "y-Axis")
        .call(yAxis)
        .attr("transform", "translate(" + padding + ", 0)")
    }
});