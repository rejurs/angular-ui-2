import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChange} from '@angular/core';
import { D3Service, D3, Selection} from 'd3-ng2-service';
// import * as dg3 from 'd3';

declare var d3: any;
declare var topojson: any;
@Component({
  selector: 'geo-chart',
  template: ''
})

export class GeoChartComponent implements OnInit {
    private dg3: D3;
    private parentNativeElement: any;

    constructor(element: ElementRef, d3Service: D3Service) { // <-- pass the D3 Service into the constructor
        this.dg3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
    }

    ngOnInit() {
        let height=600, width=950;

        let projection = d3.geo.mercator()
        .scale(1000)
        .translate([width / 3, height/2.1]);

        let radius = d3.scale.sqrt()
            .domain([0, 1e6])
            .range([0, 15]);

        let path = d3.geo.path().projection(projection);

        d3.json('./app/uscoordinates.json', function(error, data){

            let states = topojson.feature(data, data.objects.states).features;

            projection
                .scale(1000)
                .center([-106, 37.5])
            
            let radius = d3.scale.sqrt()
                .domain([0, 1e6])
                .range([0, 15]);

            let svg = d3.select("#geo-chart").append("svg")
                    .attr("width", width)
                    .attr("height", height);

            let legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
                .selectAll("g")
                .data([1e6, 5e6, 1e7])
                .enter().append("g");

            let aa = {
                "coords": [-84.044998, 33.804443],
                "properties": {
                        "hub_name":"G5SNELLVILLE (GA)",
                        "population": 1153795
                    },
            };

            legend.append("circle")
                .attr("cy", function(d) { return -radius(d); })
                .attr("r", radius);

            legend.append("text")
                .attr("y", function(d) { return -2 * radius(d); })
                .attr("dy", "1.3em")
                .text(d3.format(".1s"));
            
            svg.selectAll("path")
                .data(states).enter()
                .append("path")
                .attr("class", "border border--state land")
                .attr("d", path);

            svg.append("path")
                .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
                .attr("class", "mesh")
                .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")") 
                .attr("d", path);

            svg.append("g")
                .attr("class", "bubble")
                .selectAll("circle")
                .data([aa]).enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d.coords)[0]; })
                .attr("cy", function (d) { return projection(d.coords)[1];})
                .attr("r", function(d) { return radius(d.properties.population); })
                .attr("fill", "lightred").on('mouseover', function(d){
                    var name = d.properties.hub_name;
                    //==== TOOL TIP SHOULD COME HERE ====
                    console.log(name);
                    //return document.getElementById('name').innerHTML=name;
                })
        });
        d3.select(self.frameElement).style("height", height + "px")
            .style("width", width + "px");
    }

}
