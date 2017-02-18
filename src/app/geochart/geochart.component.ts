import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChange} from '@angular/core';
import { D3Service, D3, Selection} from 'd3-ng2-service';
import { GeoDataService } from '../services/geoservice';
import {Observable} from 'rxjs/Rx';
import { GeoDataModel } from '../geodata/geodata.model';
import { HubNames } from '../geodata/hubnames.model';

declare var d3: any;
declare var topojson: any;
@Component({
  selector: 'geo-chart',
  template: ''
})

export class GeoChartComponent implements OnInit {
    private dg3: D3;
    private parentNativeElement: any;
    private geoData: Array<Object>;
    private hubnames: HubNames[];

    @Input() hubData:any;
    @Input() height: number;
    @Input() width: number;
    @Input() divId: string;
    
    constructor(element: ElementRef, d3Service: D3Service, private geoService: GeoDataService) { // <-- pass the D3 Service into the constructor
        this.dg3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
    }

    getInitialGeoData() {
       return this.geoService.getGeoData().map(
      (geoData) => {
        this.geoData = geoData;
      })
     .catch((error) => {
        throw error;
      });
        // .subscribe(res => this.geoData = res);
    }

    ngOnInit() {       

        this.getInitialGeoData().subscribe(_ => {
            if(this.geoData) {
                this.generateGeoView(this.geoData["Hub"]);
            }
        });
    }

    generateGeoView (geoData) {
        let that = this;
        var height=Number(this.height), width=Number(this.width), divId = this.divId;

        //Setting Translate Width/Height for the default geo map
        let translateConfig;
        let scale;
        switch (divId) {
            case 'geo-central-division' :
                translateConfig = [width - width/0.56, height - height/0.85];
                scale=1200;
                break;
            case 'geo-ne-division': 
                translateConfig = [width - width/0.65, height - height/2.6];
                scale=800;
                break;
            case 'geo-west-division':
                translateConfig = [width/2,  height/2.1];
                scale=550;
                break;
            default:
                translateConfig = [width / 3, height/2.3];
                scale = 900;
                break;
        }
        var projection = d3.geo.mercator()
        .scale(scale)
        .translate(translateConfig);

        var radius = d3.scale.sqrt()
            .domain([0, 1e6])
            .range([0, 15]);

        var path = d3.geo.path().projection(projection);
        d3.json('./app/uscoordinates.json', function(error, data){

            var states = topojson.feature(data, data.objects.states).features

            projection
                .scale(scale)
                .center([-106, 37.5]);
            
            var radius = d3.scale.sqrt()
                .domain([0, 1e6])
                .range([0, 15]);

            var svg = d3.select('#' + divId)
                    .append("div")
                    .classed("svg-container", true)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 "+width+ " " + height)
                    .classed("svg-content-responsive", true);

            if(divId === "geo-chart") {
                that.plotLegend(svg, width, height);
            }

            var plotData = [];

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
            
            svg.selectAll("path")
                .data(states).enter()
                .append("path")
                .attr("class", "border border--state land")
                .attr("d", path);
            if(divId)
            svg.append("path")
                .datum(topojson.mesh(data, data.objects.states, function(a, b) { return a !== b; }))
                .attr("class", "mesh")
                .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")") 
                .attr("d", path);

            geoData.sort(function(a, b) {
                         return b.Total - a.Total; 
                    });

            geoData.forEach(bubbleData => {
                    var bubbleTooltip = `
                        <ul class="geoDataToolTip">
                            <li class="geoDataToolTipItem">
                                <strong> Hub : </strong> ` + bubbleData.HubName + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> Region : </strong> ` + bubbleData.market + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> Division : </strong> ` + bubbleData.Division + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> Total : </strong> ` + bubbleData.Total + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> Outside Headend : </strong> ` + bubbleData.OutsideHeadend + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> Within Headend : </strong> ` + bubbleData.WithinHeadend + ` 
                            </li>
                            <li class="geoDataToolTipItem">
                                <strong> FTA / FiberNodeIssue : </strong> ` + bubbleData.FTAFiberNodeissue + ` 
                            </li>
                        </ul>
                    `;
                    
                    bubbleData.coords = [(bubbleData.lng), (bubbleData.lat)];
                    svg.append("g")
                    .attr("class", "bubble")
                    .selectAll("circle")
                    .data([bubbleData]).enter()
                    .append("circle")
                    .attr("cx", function (d) { return projection(d.coords)[0]; })
                    .attr("cy", function (d) { return projection(d.coords)[1];})
                    .attr("r", function(d) { return radius(d.Total); })
                    .attr("fill", "lightred")
                    .attr('class', 'hvr-pulse')
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(bubbleTooltip)
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY + 20) + "px");
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            });

        });
        d3.select(self.frameElement).style("height", height + "px")
            .style("width", width + "px");
    }

    plotLegend (svg, width, height) {
        var radius = d3.scale.sqrt()
                .domain([0, 1e6])
                .range([0, 15]);

        var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width - 50) + "," + (height / 1.9) + ")")
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

        // var legendCalc = svg.append("g")
        //         .attr("class", "legend")
        //         .attr("transform", "translate(" + (width - 50) + "," + (height /2) + ")")
        //         .selectAll("g")
        //         .data(["1e6, 5e6, 1e7"])
        //         .enter().append("g");

        // legendCalc.append("text")
        //     .text(d3.format(".1s"));
    }
}
