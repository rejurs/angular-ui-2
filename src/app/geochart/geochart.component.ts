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

  // ngOnInit() {
  //   let dg3 = this.dg3;
  //   let d3ParentElement: Selection<any, any, any, any>;
  //   let width = 960,
  //   height = 600,
  //   formatNumber = dg3.format(",.0f");
  //   let path = dg3.geoPath(null);
  //   let radius = dg3.scaleSqrt()
  //       .domain([0, 1e6])
  //       .range([0, 15]);

  //   let svg = dg3.select("body").append("svg")
  //       .attr("width", width)
  //       .attr("height", height);

  //   let legend = svg.append("g")
  //       .attr("class", "legend")
  //       .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
  //   .selectAll("g")
  //       .data([1e6, 5e6, 1e7])
  //   .enter().append("g");

  //   legend.append("circle")
  //       .attr("cy", function(d) { return -radius(d); })
  //       .attr("r", radius);

  //   legend.append("text")
  //       .attr("y", function(d) { return -2 * radius(d); })
  //       .attr("dy", "1.3em")
  //       .text(dg3.format(".1s"));

  //   // d3.request("../../us1.json")
  //   // .mimeType("application/json")
  //   // .response(function(xhr) {
  //   //   console.log(xhr.responseText); 
  //   //   return JSON.parse(xhr.responseText); 
  //   // });

  //   d3.json('./app/us1.json', function(error, us) {
  //       console.log(us);
  //   });

  //   dg3.select(self.frameElement).style("height", height + "px");

  // }

  ngOnInit () {
    let width = 960,
    height = 600;

    let formatNumber = d3.format(",.0f");

    let path = d3.geo.path()
        .projection(null);

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

    legend.append("circle")
        .attr("cy", function(d) { return -radius(d); })
        .attr("r", radius);

    legend.append("text")
        .attr("y", function(d) { return -2 * radius(d); })
        .attr("dy", "1.3em")
        .text(d3.format(".1s"));
// ===== DATA JSON ADDED HERE =====//
    d3.json("./app/us1.json", function(error, us) {
        console.log(us);
    if (error) throw error;

    svg.append("path")
        .datum(topojson.feature(us, us.objects.nation))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "border border--state")
        .attr("d", path);

    svg.append("g")
        .attr("class", "bubble")
        .selectAll("circle")
        .data(topojson.feature(us, us.objects.counties).features
            .sort(function(a, b) { return b.properties.population - a.properties.population; }))
        .enter().append("circle")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("r", function(d) { return radius(d.properties.population); })
        .append("title")
        .text(function(d) {
            return d.properties.name
                + "\nPopulation " + formatNumber(d.properties.population);
        });
    });

    d3.select(self.frameElement).style("height", height + "px");
  }

}
