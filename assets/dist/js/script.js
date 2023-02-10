document.addEventListener('DOMContentLoaded', function () {
    var w = 500;
    var h = 500;
    const multiplier = 50;
    const radius = 1;

    let svg = d3.select("#canvas")
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", 500)
        .attr("height", 500);

    //Streets Map 
    d3.json("./data/streets.json").then(function (data) {
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
                return d[0] * 25
            })
            .attr("y1", function (d) {
                return d[1] * 25
            })
            .attr("x2", function (d) {
                return d[2] * 25
            })
            .attr("y2", function (d) {
                return d[3] * 25
            });
    });

    // Pumps
    d3.csv("./data/pumps.csv").then(function (data) {
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
                return radius * 5;
            })
            .attr("fill", "red");
    });


    d3.csv("./data/deaths_age_sex.csv").then(function (data) {
        var genderPieData = new Array(2).fill(0);
        var agePieData = {zero: 0, one: 0, two: 0, three: 0, four: 0, five: 0}
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
                    agePieData.zero += 1;// <= 10
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
        // Render death circles, gender, and age charts 
        DeathCircles(data);
        GenderPieChart(genderPieData);
        AgePieChart(agePieData);
    });

    function DeathCircles(data) {
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

    function GenderPieChart(pieData) {
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
                if(d.index == 1){
                    return "Male - " + d.value; 
                } else {
                    return "Female - " + d.value; 
                }
            });
    }

    function AgePieChart(agePieData) {
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
});