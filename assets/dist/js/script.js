document.addEventListener('DOMContentLoaded', function () {
    var w = 750;
    var h = 500;
    const multiplier = 25;
    const radius = 1.5;

    var deathData;
    var sliderData;
    var dayCounter = 1;


    // Parent SVG for all map elements
    let svg = d3.select("#canvas")
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", w)
        .attr("height", h);

    //Child g element is to handle zoom. Shit gets all jittery without this.
    let mapContainer = d3.select("svg#map-svg")
        .append("g")
        .attr("id", "map-container")

    LoadAllData();
    SetupZoom();
    SetupFilters();
    



    function LoadAllData() {
        d3.json("./data/streets.json").then(function (data) {
            //RenderStreets(data);
            RenderPathStreets(data);
        });
        d3.csv("./data/deathdays.csv").then(function (data) {
            // Death data gets "massaged" later on
            deathData = data.slice();
            RenderDeathBarGraph(deathData);

            // Create a separate unchanged array for slider
            sliderData = data.slice();
            SetupSlider(sliderData);
            
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

    function SetupSlider(sliderData) {

        // Parse Date format
        var dateFormat  = d3.timeFormat("%b %d");
        var parseDate  = d3.timeParse("%-d-%b");
        const slider = document.getElementById('date-slider');
        const sliderLabel = document.getElementById('slider-label');
        var value = slider.value -1;
        var date = sliderData[value].date;
        sliderLabel.textContent = dateFormat(date);

        slider.addEventListener('input', () => {
            slider.setAttribute('value', slider.value);
            var value = slider.value -1;
            var date = sliderData[value].date;
            sliderLabel.textContent = dateFormat(date);

            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedValues = Array.from(selectedCheckboxes).map((checkbox) => checkbox.value);
            FilterCircles(selectedValues);
        });

    }

    /*function RenderStreets(data) {
        var padding = 50;
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

        var g = d3.select("#map-container")
            .append("g")
            .attr("id", "streets");

        var lines = g.selectAll("line")
            .data(streets)
            .enter()
            .append("line");

        g.append("path")
            .data([streets])
            .enter()
            .append("path")
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
    }*/

    function RenderPathStreets(data) {
        var padding = 50;
        var xScale = d3.scaleLinear()
            .domain([0, w])
            .range([0, w]);
        var yScale = d3.scaleLinear()
            .domain([0, h])
            .range([0, h]);

        var streetsG = d3.select("#map-container")
            .append("g")
            .attr("id", "streets")
            .selectAll('line')
            .data(data)

        var lines = d3.line()
            .x(function (d) {
                return xScale(d.x) * multiplier;
            })
            .y(function (d) {
                return yScale(d.y) * multiplier;
            })

        streetsG.enter()
            .append('path')
            .attr("d", lines)
            .attr("class", "street")
            .attr("stroke", "black")
            .attr("stroke-width", .5)
            .style("fill", "none");

    }

    function RenderPumps(data) {
        var g = d3.select("#map-container")
            .append("g")
            .attr("id", "pumps");
        var pumps = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        pumps.attr("class", "pump")
            .attr("cx", function (d) {
                return d.x * multiplier;
            })
            .attr("cy", function (d) {
                return d.y * multiplier;
            })
            .attr("r", function (d) {
                return radius * 2;
            })
            .attr("fill", "red")
            .append("title")
            .text(function (d) {
                return "Pump";
            })
    }

    function RenderDeathCircles(data) {
        var g = d3.select("#map-container")
            .append("g")
            .attr("id", "cirles");
        var circles = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        circles.attr("cx", function (d) {
                return d.x * multiplier;
            })
            .attr("cy", function (d) {
                return d.y * multiplier;
            })
            .attr("r", function (d) {
                return radius;
            })
            .attr("data-age", function (d) {
                return GetRangeLabel(d.age);
            })
            .attr("data-gender", function (d) {
                return GetGender(d.gender);
            })
            .attr("data-death", function (d) {
                return GetDeathDate(deathData);
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
                    return "circle female";
                } else {
                    return "circle male";
                }
            })
            .append("title")
            .text(function (d) {
                return "Age: " + GetRangeLabel(d.age) + ", Gender: " + GetGender(d.gender);
            })

    }

    function GetDeathDate(deathData) {
        let localDeathData = deathData;
        var deathCount = parseInt(localDeathData[0].deaths);
        var newCount;
        while (deathCount == 0) {
            localDeathData.shift();
            deathCount = parseInt(localDeathData[0].deaths);
            dayCounter++;
        }
        if (deathCount > 0) {
            newCount = deathCount - 1;
            localDeathData[0].deaths = newCount.toString();
            return dayCounter;
        }
    }

    function GetGender(d) {
        if (d == 0) {
            return "Male"
        } else {
            return "Female"
        }
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

        var color = d3.scaleOrdinal(['#003f5c', '#58508d', '#bc5090', '#984ea3', '#ff6361', '#ffa600']);
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
                return GetRangeLabel(d.value, agePieData);
            });
    }

    function GetRangeLabel(value, agePieData) {
        if (agePieData != undefined) {
            var range = Object.keys(agePieData).find(key => agePieData[key] === value);
        } else {
            range = value
        }
        switch (range) {
            case "0":
            case "zero":
                return "0-10";
            case "1":
            case "one":
                return "11-20";
            case "2":
            case "two":
                return "21-40";
            case "3":
            case "three":
                return "41-60";
            case "4":
            case "four":
                return "61-80";
            case "5":
            case "five":
                return "> 80";
            default:
                return;
        }
    }

    function RenderDeathBarGraph(data) {
        w = 700;
        h = 400;
        var padding = 50;

        // Parse Date format
        var dateFormat = d3.timeFormat("%b %d");
        var parseDate = d3.timeParse("%-d-%b");
        data.forEach(function (d) {
            d.date = parseDate(d.date);
        });

        let barSvg = d3.select("#day-bar-graph")
            .append("svg")
            .attr("id", "bar-svg")
            .attr("width", w + padding)
            .attr("height", h + padding);

        // Scales
        var xScale = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return d.date;
            }))
            .range([0, w]);
        var yMax = d3.max(data, function (d) {
            return +d.deaths;
        });
        var yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([0, h]);

        // For the Y Axis and Bar Value labels. Domain was a pain in the ass to invert, so just give those two their own scale.  
        var invertedYScale = d3.scaleLinear()
            .domain([yMax, 0])
            .range([0, h]);

        // Added a color scale for bars
        var color = d3.scaleSequential(d3.interpolateReds)
            .domain([0, d3.max(data, function (d) {
                return d.deaths;
            })]);

        // Bars
        barSvg.append("g")
            .attr("id", "bars")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", function (d) {
                return color(d.deaths);
            })
            .attr("x", function (d, i) {
                return i * (w / data.length) + padding;
            })
            .attr("width", w / data.length)
            .attr("y", function (d) {
                return h - yScale(d.deaths);
            })
            .attr("height", function (d) {
                return yScale(d.deaths);
            })
            .append("title")
            .text(function (d) {
                return dateFormat(d.date) + ": " + d.deaths + " deaths";
            })

        // Axis Scale and Ticks
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(data.length);
        var yAxis = d3.axisLeft()
            .scale(invertedYScale)
            .ticks(20);

        // x axis
        var xAxisGroup = barSvg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(" + padding + "," + h + ")")
            .call(xAxis)

        xAxisGroup.selectAll("text")
            .text(function (d) {
                return dateFormat(d)
            })
            .style("text-anchor", "end")
            .attr("dx", "-.75em")
            .attr("dy", "-.65em")
            .attr("transform", "rotate(-90)")

        xAxisGroup.append("text")
            .attr("id", "x-axis-label")
            .attr("y", 50)
            .attr("x", w / 2)
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text("Dates")
            .attr("font-size", "12px")

        //y axis
        barSvg.append("g")
            .attr("id", "y-Axis")
            .call(yAxis)
            .attr("transform", "translate(" + padding + ", 0)")
            .append("text")
            .attr("font-size", "12px")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", h / -2)
            .attr("dy", "-4em")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text("Deaths");
    }

    //Zoom
    function SetupZoom(params) {
        // Handle Zoom Event 
        var zoom = d3.zoom()
            .scaleExtent([1, 10])
            //.translateExtent([[0,0], [w * 2, h * 2]])
            .on("zoom", handleZoom);

        function handleZoom(e) {
            d3.select("#map-container")
                .attr("transform", e.transform);
        }
        d3.select("#map-svg")
            .call(zoom);
    }

    //Filters
    function SetupFilters() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                const selectedValues = Array.from(selectedCheckboxes).map((checkbox) => checkbox.value);
                FilterCircles(selectedValues);
            });
        });
    }


    function FilterCircles(selectedValues) {
        const circles = document.querySelectorAll('.circle');
        const dateValue = document.getElementById('date-slider').value;

        circles.forEach((circle) => {
            const age = circle.getAttribute('data-age');
            const gender = circle.getAttribute('data-gender');
            const deathDate = parseInt(circle.getAttribute('data-death'));


            if (selectedValues.includes(age) && selectedValues.includes(gender) && deathDate <= dateValue) {
                circle.style.display = 'block';
            } else {
                circle.style.display = 'none';
            }
        });

    }

});