document.addEventListener('DOMContentLoaded', function () {
    const w = 700;
    const h = 700;
    var multiplier = 30;
    const radius = 1.5;
    var xAdjustment = 101;
    var yAdjustment = 96;
    var padding = 100;

    var deathData;
    var streetsData;
    var buildingsData;
    var streetNamesData;
    var sliderData;
    var dasData; // Death, Age, Sex
    var gridBounds = [];
    var genderPieData = [0, 0];
    var agePieData = {
        zero: 0,
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0
    }
    var dayCounter = 1;

    // Parent SVG for all map elements
    let svg = d3.select("#canvas")
        .append("svg")
        .attr("id", "map-svg")
        .attr("class", "shadow-lg")
        .attr("width", w)
        .attr("height", h);

    //Child g element is to handle zoom. Shit gets all jittery without this.
    let mapContainer = d3.select("svg#map-svg")
        .append("g")
        .attr("id", "map-container")

    LoadAllData();
 
    async function LoadAllData() {
        const streets = await d3.json("./data/streets.json").then(function (data) {
            streetsData = data;
        });
        const buildings = await d3.json("./data/buildings.json").then(function (data) {
            buildingsData = data;
        });
        const streetNames = await d3.json("./data/street-names.json").then(function (data) {
            streetNamesData = data;
        });
        const deaths = await d3.csv("./data/deathdays.csv").then(function (data) {
            deathData = data.slice();
            sliderData = data.slice();
            //deathData = data;
        });
        const pumps = await d3.csv("./data/pumps.csv").then(function (data) {
            pumpData = data;
        });
        // Death, Age, Sex data
        const das = await d3.csv("./data/deaths_age_sex.csv").then(function (data) {
            dasData = data;
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
        });

        Promise.all([streets, buildings, streetNames, deaths, pumps, das]).then((values) => {
            RenderPathStreets(streetsData);
            RenderDeathBarGraph(deathData);
            
            SetupSlider(sliderData);
            
            RenderBuildings(buildingsData);
            RenderStreetNames(streetNamesData);
            RenderPumps(pumpData);
            SetupGrid();
            // Pass "massaged" data to render death circles, gender, and age charts and 
            RenderDeathCircles(dasData);
            RenderGenderPieChart(genderPieData);
            RenderAgePieChart(agePieData);
            console.log("Data loaded");
            SetupZoom();
            SetupFilters();
            GridTooltipHover();
            BarGraphClickEvent();
            GenderPeiChartHover();
            AgePeiChartHover();
        });
    }

    function SetupSlider(sliderData) {
        // Parse Date format
        var dateFormat = d3.timeFormat("%b %d");
        var parseDate = d3.timeParse("%-d-%b");
        const slider = document.getElementById('date-slider');
        const sliderLabel = document.getElementById('slider-label');
        var value = slider.value - 1;
        var date = sliderData[value].date;
        sliderLabel.textContent = dateFormat(date);

        slider.addEventListener('input', () => {
            slider.setAttribute('value', slider.value);
            var value = slider.value - 1;
            var date = sliderData[value].date;
            sliderLabel.textContent = dateFormat(date);

            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedValues = Array.from(selectedCheckboxes).map((checkbox) => checkbox.value);
            FilterCircles(selectedValues);
        });

    }

    function RenderPathStreets(data) {
        var streetsG = d3.select("#map-container")
            .append("g")
            .attr("id", "streets")
            .selectAll('line')
            .data(data)

        var lines = d3.line()
            .x(function (d) {
                return d.x * multiplier ;
            })
            .y(function (d) {
                return d.y * multiplier ;
            })

        streetsG.enter()
            .append('path')
            .attr("d", lines)
            .attr("class", "street")
            .attr("stroke", "#212529")
            .attr("stroke-width", .5)
            .style("fill", "none");
    }

    function RenderBuildings(data) {
        var g = d3.select("#map-container")
            .append("g")
            .attr("id", "buildings-container");
        var buildings = g.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return d.rotate;
            });



        buildings.append("text")
        .attr("class", "buildings")
            .text(function (d) {
                return d.name;
            })
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y ;
            })
            .attr("fill", "#c0c0c0")
            .attr("font-size", function (d) {
                return d.size ;
            })
    }

    function RenderStreetNames(data) {
        var g = d3.select("#map-container")
            .append("g")
            .attr("id", "streets-container");
        var buildings = g.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return d.rotate;
            });


        buildings.append("text")
        .attr("class", "street-names")
            .text(function (d) {
                return d.name;
            })
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y ;
            })
            .attr("fill", "#c0c0c0")
            .attr("font-size", function (d) {
                return d.size ;
            })
            .attr("letter-spacing", function (d) {
                return d.space ;
            })
    }

    function SetupGrid() {
        var grid = 10;
        var numRows = grid;
        var numCols = grid;
        var rectWidth = 50;
        var rectHeight = 50;

        var gridData = [];
        var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"]
        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                gridData.push({
                    row: row,
                    col: col,
                    label: alphabet[col] + ( row + 1)
                });
                const x = col * rectWidth;
                const y = row * rectHeight;
                const bounds = [
                    [alphabet[col] + (row+1)],
                    // x lower and higher bounds
                    // adjustment is to overlap grid over map
                    [x + xAdjustment , x + rectWidth + xAdjustment],
                    // y lower and higher bounds
                    [y + yAdjustment, y + rectHeight + yAdjustment]
                ];
                gridBounds.push(bounds);
            }
            
        }
        var gridContainer = d3.select("#map-container")
            .append("g")
            .attr("id", "grid-container")
            .style("display", "none");

        var grids = gridContainer.selectAll("rect")
            .data(gridData)
            .enter()
            .append("rect")
            .attr("class", "grid")
            .attr("id", function (d) {
                return d.label;
            })
            .attr("x", function (d) {
                return d.col * rectWidth + xAdjustment;
            })
            .attr("y", function (d) {
                return d.row  * rectHeight + yAdjustment;
            })
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            // .append("title")
            //     .text(function (d) {
            //         return d.label;
            //     })
            //     .attr("x", function (d) {
            //         return d.col * rectWidth + xAdjustment;
            //     })
            //     .attr("y", function (d) {
            //         return d.row  * rectHeight + yAdjustment;
            //     })
            //     .attr("text-anchor", "middle")
            //     .attr("fill", "black");
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
                return radius * 3;
            })
            .attr("fill", "#EFAD15")
            .attr("stroke", "#212529")
            .attr("stroke-width", 1)
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
                return d.age;
            })
            .attr("data-gender", function (d) {
                return GetGender(d.gender)
            })
            .attr("data-death", function (d) {
                return GetDeathDate(deathData);
            })
            .attr("data-grid", function (d) {
                return GetGridPosition(d);
            })
            .attr("fill", function (d) {
                if (d.gender == 1) {
                    return "#ffa8d9"; // pink
                } else {
                    return "#759eff"; // blue
                }
            })
            .attr("stroke", "#212529")
            .attr("stroke-width", .1)
            .attr("class", function (d) {
                if (d.gender == 1) {
                    return "circle female";
                } else {
                    return "circle male";
                }
            })
            .append("title")
            .text(function (d) {
                return "Age: " + GetRangeLabelJustValue(d.age) + ", Sex: " + GetGender(d.gender) + ", Grid: " + GetGridPosition(d);
            })

    }

    function GetGridPosition(d) {
        var xScale = d3.scaleLinear()
            .domain([0, w])
            .range([0, w]);
        var yScale = d3.scaleLinear()
            .domain([0, h])
            .range([0, h]);
        var position = "";
        var scaledDx = xScale(d.x) * multiplier;
        var scaledDy = yScale(d.y) * multiplier;
        gridBounds.map( rectBounds => {
            if (scaledDx > rectBounds[1][0] && scaledDx < rectBounds[1][1] && scaledDy > rectBounds[2][0] && scaledDy < rectBounds[2][1]) {
                position += rectBounds[0][0]
            }
        })
        return position;

    }

    function GetRangeLabelJustValue(value) {
        switch (value) {
            case "0":
                return "0-10";
            case "1":
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

    function GetDeathDate(deathData) {
        var deathCount = parseInt(deathData[0].deaths);
        var newCount;
        while (deathCount == 0) {
            deathData.shift();
            deathCount = parseInt(deathData[0].deaths);
            dayCounter++;
        }
        if (deathCount > 0) {
            newCount = deathCount - 1;
            deathData[0].deaths = newCount.toString();
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
        const w = 225;
        const h = 225;
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

        var color = d3.scaleOrdinal(['#759eff', '#ffa8d9']);
        //var color = d3.scaleOrdinal(['#0000FF', '#ffa8d9']);
        var pie = d3.pie();
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var arcs = g.selectAll("arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "gender-arc")

        arcs.append("path")
            .attr("fill", function (d, i) {
                //return color(i);
                // hardcoded array position for m and f
                if (i === 1) {
                    return "#ffa8d9"; // pink

                } else if (i === 0) {
                    return "#759eff"; // blue
                }
            })
            .attr("d", arc);

        arcs.append("text")
            .attr("id", function (d,i) {
                if (i == 1) {
                    return "female-value";
                }  {
                    return "male-value";
                }
            })
            .attr("class", function (d) {
                return "gender-value"
            })
            .style("fill", "white")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .text(function (d, i) {
                if (d.value > 0 && i == 1) {
                    return d.value;
                } else if (d.value > 0 && i == 0) {
                    return d.value;
                }
            });
    }

    function RenderAgePieChart(agePieData) {
        const w = 225;
        const h = 225;
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

        var color = d3.scaleOrdinal(['#EE6352', '#59CD90', '#bc5090', '#3FA7D6', '#FAC05E', '#D8D4F2']);
        var pie = d3.pie();
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius);

        var arcs = g.selectAll("arc")
            .data(pie(Object.values(agePieData)))
            .enter()
            .append("g")
            .attr("class", "age-arc")

        arcs.append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc);
        arcs.append("text")
            .attr("id", function (d,i) {
                return "pie-age-" + i;
            })
            .attr("class", function (d) {
                return "age-range"
            })
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .text(function (d, i) {
                if (d.value > 0) {
                    return d.value;
                }
                // return GetRangeLabel(d.value, i, agePieData);
            });
    }
    // Not used
    function GetRangeLabel(value, index, agePieData) {
        if (agePieData != undefined) {
            var range = Object.keys(agePieData)[index];
        }
        switch (range) {
            case "zero":
                if (value > 0) {
                    return "0-10";
                } else {
                    break;
                }
            case "one":
                if (value > 0) {
                    return "11-20";
                } else {
                    break;
                }
            case "two":
                if (value > 0) {
                    return "21-40";
                } else {
                    break;
                }
            case "three":
                if (value > 0) {
                    return "41-60";
                } else {
                    break;
                }
            case "four":
                if (value > 0) {
                    return "61-80";
                } else {
                    break;
                }
            case "five":
                if (value > 0) {
                    return "> 80";
                } else {
                    break;
                }
                default:
                    return;
        }

    }

    function RenderDeathBarGraph(data) {
        const w = 700;
        const h = 400;
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
            .attr("data-val", function(d,i ){
                return i + 1;
            })
            .style("cursor", "pointer")
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
            .attr("fill", "#212529")
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
            .attr("fill", "#212529")
            .text("Deaths");
    }

    //Zoom
    function SetupZoom() {
        var zoom = d3.zoom()
            .scaleExtent([1, 15])
            .on("zoom", handleZoom);

        function handleZoom(e) {
            d3.select("#map-container")
                .attr("transform", e.transform);
        }
        d3.select("#map-svg")
            .call(zoom);
    }

    function GridTooltipHover() {
        var grids = document.querySelectorAll('.grid');
        var gridTooltip = document.getElementById('grid-tooltip');
		var gridDeaths = document.getElementById('grid-deaths');
        var gridIdLabel = document.getElementById('grid-id');
        var tooltipDeathCount = 0;
		grids.forEach(grid => {
			grid.addEventListener('mouseover', () => {
                var circles =  document.querySelectorAll(`[data-grid=${grid.id}]`);
                circles.forEach(circle => {
                    if (circle.style.display == "block") {
                        circle.style.strokeWidth = .75;
                        tooltipDeathCount++
                    }
                })
				gridDeaths.innerHTML = tooltipDeathCount;
                gridIdLabel.innerHTML = grid.id;
				gridTooltip.style.display = "block";
			});

			grid.addEventListener('mouseout', () => {
                var circles =  document.querySelectorAll(".circle");
                circles.forEach(circle => {
                    circle.style.strokeWidth = .25;
                })
				gridTooltip.style.display = "none";
                tooltipDeathCount = 0;
			});

			grid.addEventListener('mousemove', (event) => {
				gridTooltip.style.left = event.pageX + 20 + "px";
				gridTooltip.style.top = event.pageY + 20 + "px";
			});
		});
     
    }

    function GenderPeiChartHover() {
        var arcs = document.querySelectorAll('.gender-arc');
        var pieTooltip = document.getElementById('pie-tooltip');
		var percentageTooltip = document.getElementById('percentage-value');
        //var gridIdLabel = document.getElementById('grid-id');
        var percentage = 0;
        
		arcs.forEach(arc => {
			arc.addEventListener('mouseover', () => {
                var thisVal = arc.querySelector('.gender-value').innerHTML;
                var maleVal = document.getElementById('male-value').innerHTML;
                var femaleVal = document.getElementById('female-value').innerHTML;
                maleVal = +maleVal;
                femaleVal = +femaleVal;
                percentage = thisVal / (maleVal + femaleVal);

				percentageTooltip.innerHTML = (percentage * 100).toFixed(2);
                pieTooltip.style.display = "block";
			});

			arc.addEventListener('mouseout', () => {
				pieTooltip.style.display = "none";
                percentage = 0;
			});

			arc.addEventListener('mousemove', (event) => {
				pieTooltip.style.left = event.pageX - 150 + "px";
				pieTooltip.style.top = event.pageY + 20 + "px";
			});
		});
     
    }

    function AgePeiChartHover() {
        var arcs = document.querySelectorAll('.age-arc');
        var ageTooltip = document.getElementById('age-tooltip');
		var agePercentage = document.getElementById('age-percentage');
        //var gridIdLabel = document.getElementById('grid-id');
        var percentage = 0;
        
		arcs.forEach(arc => {
			arc.addEventListener('mouseover', () => {
                var thisVal = arc.querySelector('.age-range').innerHTML;
                var zeroVal = document.getElementById('pie-age-0').innerHTML;
                var oneVal = document.getElementById('pie-age-1').innerHTML;
                var twoVal = document.getElementById('pie-age-2').innerHTML;
                var threeVal = document.getElementById('pie-age-3').innerHTML;
                var fourVal = document.getElementById('pie-age-4').innerHTML;
                var fiveVal = document.getElementById('pie-age-5').innerHTML;
                zeroVal = +zeroVal;
                oneVal = +oneVal;
                twoVal = +twoVal;
                threeVal = +threeVal;
                fourVal = +fourVal;
                fiveVal = +fiveVal;


                percentage = thisVal / (zeroVal + oneVal + twoVal + threeVal + fourVal + fiveVal);

				agePercentage.innerHTML = (percentage * 100).toFixed(2);
                ageTooltip.style.display = "block";
			});

			arc.addEventListener('mouseout', () => {
				ageTooltip.style.display = "none";
                percentage = 0;
			});

			arc.addEventListener('mousemove', (event) => {
				ageTooltip.style.left = event.pageX - 150 + "px";
				ageTooltip.style.top = event.pageY + 20 + "px";
			});
		});
     
    }

    function BarGraphClickEvent() {
        const rects = document.querySelectorAll('rect.bar');
        const dateSlider = document.getElementById('date-slider');

        rects.forEach(rect => {
        rect.addEventListener('click', () => {
            const day = parseInt(rect.getAttribute('data-val'));
            dateSlider.value = day;
            const event = new Event('input');
            dateSlider.dispatchEvent(event);


        });
});
    }

    //Filters
    function SetupFilters() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                const selectedValues = Array.from(selectedCheckboxes).map((checkbox) => checkbox.value);
                FilterCircles(selectedValues);
                Toggles(selectedValues);
            });
        });
    }

    //Apply filter selections to all circles
    function FilterCircles(selectedValues) {
        const circles = document.querySelectorAll('.circle');
        const dateValue = document.getElementById('date-slider').value;
        const totalDeathElement = document.getElementById('total-death-count');
        const daysElapsed = document.getElementById('days-elapsed');
        const avgDeaths = document.getElementById('avg-deaths');

        var updatedGenderData = [0, 0];
        var updatedAgeData = {
            zero: 0,
            one: 0,
            two: 0,
            three: 0,
            four: 0,
            five: 0
        }
        var updatedTotalDeathCount = 0;
        circles.forEach((circle) => {
            const age = circle.getAttribute('data-age');
            const gender = circle.getAttribute('data-gender');
            const deathDate = parseInt(circle.getAttribute('data-death'));

            if (selectedValues.includes(age) && selectedValues.includes(gender) && deathDate <= dateValue) {
                circle.style.opacity = '1';
                circle.style.display = 'block';
                // Capture counts to update pie charts
                if (gender == "Female") {
                    updatedGenderData[1]++;
                } else {
                    updatedGenderData[0]++;
                }
                switch (age) {
                    case "0":
                        updatedAgeData["zero"]++; // 
                        break;
                    case "1":
                        updatedAgeData["one"]++; // >= 11 &&  <=20
                        break;
                    case "2":
                        updatedAgeData["two"]++; // >= 21 && i.age <=40
                        break;
                    case "3":
                        updatedAgeData["three"]++; // >= 41 && <=60
                        break;
                    case "4":
                        updatedAgeData["four"]++; //  >= 61 &&  <=80
                        break;
                    case "5":
                        updatedAgeData["five"]++; // > 80 
                        break;
                    default:
                        break;
                }
                updatedTotalDeathCount++;
            } else {
                circle.style.opacity = '0';
                circle.style.display = 'none';
            }
        });
        // Update Counters
        totalDeathElement.textContent = updatedTotalDeathCount;
        daysElapsed.textContent = dateValue ;
        avgDeaths.textContent = (updatedTotalDeathCount / (dateValue)).toFixed(2);
        RefreshPieCharts(updatedGenderData, updatedAgeData)
    }

    function Toggles(selectedValues) {
        const gridElement = document.getElementById('grid-container');
        const pumpElements = document.querySelectorAll('.pump');
        const buildingsElements = document.querySelectorAll('.buildings');
        const streenNameElements = document.querySelectorAll('.street-names');

        if (selectedValues.includes("Grid")) {
            gridElement.style.display = 'block';
        } else {
            gridElement.style.display = 'none';
        }

        if (selectedValues.includes("Pumps")) {
            pumpElements.forEach((pump) => {
                pump.style.display = 'block';
            })
        } else {
            pumpElements.forEach((pump) => {
                pump.style.display = 'none';
            })
        }
        if (selectedValues.includes("Buildings")) {
            buildingsElements.forEach((building) => {
                building.style.display = 'block';
            })
        } else {
            buildingsElements.forEach((building) => {
                building.style.display = 'none';
            })
        }
        if (selectedValues.includes("Street Names")) {
            streenNameElements.forEach((building) => {
                building.style.display = 'block';
            })
        } else {
            streenNameElements.forEach((building) => {
                building.style.display = 'none';
            })
        }
    }

    function RefreshPieCharts(updatedGenderData, updatedAgeData) {
        const genderPie = document.getElementById('pie-svg');
        genderPie.remove();
        RenderGenderPieChart(updatedGenderData);
        GenderPeiChartHover();
        const agePie = document.getElementById('age-pie-svg');
        agePie.remove();
        if (x => (updatedAgeData.forEach(key => {
                if (key.value > 0) {
                    return true;
                }
            }))) {
            RenderAgePieChart(updatedAgeData);
            AgePeiChartHover();
        } else {
            updatedAgeData = [0, 0, 0, 0, 0, 0]
            RenderAgePieChart(updatedAgeData);
            AgePeiChartHover();
        }
    }

    
});