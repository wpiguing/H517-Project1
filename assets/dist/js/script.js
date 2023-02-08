document.addEventListener('DOMContentLoaded', function () {
    var w = 500;
    var h = 500;
    let svg = d3.select("#canvas")
        .append("svg")
        .attr("id", "map-svg")
        .attr("width", w)
        .attr("height", h);
    
    //Streets Map 
    d3.json("/data/streets.json").then(function (data) {
        var g = d3.select("#map-svg")
            .append("g")
            .attr("id", "streets");

        var streets = [];
        var street = [];
        street = data.map(function (d) {
            street = [];
            street.push(d[0].x, d[0].y, d[1].x, d[1].y);
            streets.push(street);         
        });

         var lines = g.selectAll("line")
             .data(streets)
             .enter()
             .append("line");

         lines.style("stroke", "black")
             .style("stroke-width", 1)
             .attr("x1", function(d){
                return d[0] * 25
             })
             .attr("y1", function(d){
                return d[1] * 25
             })
             .attr("x2", function(d){
                return d[2] * 25
             })
             .attr("y2", function(d){
                return d[3] * 25
             })
    });

    // Death Coordinates
    d3.csv("/data/deaths_age_sex.csv").then(function (data) {
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
                return 1;
            });



    });


});