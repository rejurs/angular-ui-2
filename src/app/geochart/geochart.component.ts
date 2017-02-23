import {Component, ElementRef, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import { D3Service, D3, Selection} from 'd3-ng2-service';
import { GeoDataService } from '../services/geoservice';
import {Observable} from 'rxjs/Rx';
import { HubNames } from '../geodata/hubnames.model';

declare var d3: any;
declare var topojson: any;
@Component({
  selector: 'geo-chart',
  encapsulation: ViewEncapsulation.None,
  template: '',
  styleUrls: ['./geochart.component.css']
})

export class GeoChartComponent implements OnInit {
    private dg3: D3;
    private parentNativeElement: any;
    private geoData: Array<Object>;
    private hubnames: HubNames[];
    private newVal: HubNames[];

    @Input() hubdata:any
    @Input() height: number
    @Input() width: number
    @Input() divId: string
    
    constructor(element: ElementRef, d3Service: D3Service, private geoService: GeoDataService) { // <-- pass the D3 Service into the constructor
        this.dg3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
    }

    getHubDetails() {
        this.geoService.getHubData().subscribe( (data) => {
            this.hubnames = data;
            this.generateGeoView(this.hubnames);
        });
    }

    ngOnInit() {
        let that = this;

        this.geoService.socketData.subscribe( (value: HubNames[]) => {
            this.regenrateMap(value);
        });

    }

    regenrateMap(market: HubNames[]) {
        let id;
        switch(this.divId) {
            case 'geo-central-division': id="central-division";
                break;
            case 'geo-ne-division': id="ne-division";
                break;
            case 'geo-west-division': id="west-division";
                break;
            default: id="main-geo-chart";
                break; 
        }
        d3.select("#" + id).remove();
        if(id === "main-geo-chart") {
            d3.selectAll(".tooltip").remove();
        }
        this.hubnames = market;
        this.generateGeoView(this.hubnames);
    }

    generateGeoView (geoData) {
        let that = this;
        var height=Number(this.height), width=Number(this.width), divId = this.divId;

        //Setting Translate Width/Height for the default geo map
        let translateConfig;
        let scale, id;
        switch(divId) {
            case 'geo-central-division': translateConfig = [width - width/0.52, height - height/0.82];
                scale=1200;
                id="central-division";
                break;
            case 'geo-ne-division': translateConfig = [width - width/0.65, height - height/2.6];
                scale=800;
                id="ne-division";
                break;
            case 'geo-west-division': translateConfig = [width/2.3,  height/2.1];
                scale=550;
                id="west-division";
                break;
            default: translateConfig = [width / 3, height/2.7];
                scale = 775;
                id="main-geo-chart";
                break; 
        }

        var projection = d3.geoMercator()
        .scale(scale)
        .translate(translateConfig);

        var radius = d3.scaleSqrt()
            .domain([0, 1e6])
            .range([0, 15]);

        var path = d3.geoPath().projection(projection);
        this.geoService.getUsCoordinates().subscribe( (data) => {
            var states = topojson.feature(data, data.objects.states).features

            projection
                .scale(scale)
                .center([-106, 37.5]);
            
            var radius = d3.scaleSqrt()
                .domain([0, 1e6])
                .range([0, 50]);

            var svg = d3.select('#' + divId)
                    .append("div")
                    .classed("svg-container", true)
                    .attr("id", id)
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 "+width+ " " + height)
                    .classed("svg-content-responsive", true);

            if(divId === "geo-chart") {
                that.plotLegend(svg, width, height);
            }

            var plotData = [];
            
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("display", "none");
            
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
                         return b.total - a.total; 
                    });

            geoData.forEach(bubbleData => {
                var bubbleTooltip = `
                    <ul class="geoDataToolTip">
                        <li class="geoDataToolTipItem">
                            <strong> Hub : </strong> ` + bubbleData.name + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> Region : </strong> ` + bubbleData.market + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> Division : </strong> ` + bubbleData.division + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> Total : </strong> ` + bubbleData.total + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> Outside Headend : </strong> ` + bubbleData.outsideHeadEnd + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> Within Headend : </strong> ` + bubbleData.withinHeadEnd + ` 
                        </li>
                        <li class="geoDataToolTipItem">
                            <strong> FTA / FiberNodeIssue : </strong> ` + bubbleData.fiberNodeIssue + ` 
                        </li>
                    </ul>
                `;
                if(bubbleData.lon && bubbleData.lat) {
                    bubbleData.coords = [(bubbleData.lon), (bubbleData.lat)];
                    svg.append("g")
                    .attr("class", "bubble")
                    .selectAll("circle")
                    .data([bubbleData]).enter()
                    .append("circle")
                    .attr("cx", function (d) { return projection(d.coords)[0]; })
                    .attr("cy", function (d) { return projection(d.coords)[1];})
                    .attr("r", function(d) { return radius(d.total); })
                    .attr("id", function(d) { 
                        if(d.uid) return d.uid; 
                    })
                    .attr("class", function(d) {
                        let className = d.isNew ? 'hvr-pulse newItem' : 'hvr-pulse';
                        id=="west-division" ? d.isNew = false : '';
                        return className;
                    })
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("display", "block");    
                        div.html(bubbleTooltip)
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY + 20) + "px");
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("display", "none");
                    });
                }
            });

        
            d3.select(self.frameElement)
                .style("height", height + "px")
                .style("width", width + "px");
        });
    }

    plotLegend (svg, width, height) {
        var radius = d3.scaleSqrt()
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
    }
}
