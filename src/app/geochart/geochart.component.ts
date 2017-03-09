import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { GeoDataService } from '../services/geoservice.ts';
import {Observable} from 'rxjs/Rx';
import { Subject }    from 'rxjs/Subject';
import { HubNames } from '../geodata/hubnames.model';

declare var d3: any;
declare var require: any;

var topojson = require('topojson');

@Component({
  selector: 'geo-chart',
  encapsulation: ViewEncapsulation.None,
  template: '',
  styleUrls: ['./geochart.component.css']
})
export class GeoChartComponent {

    @Input() height: number
    @Input() width: number
    @Input() divId: string

    mainData: Subject<HubNames[]> = new Subject<HubNames[]>();
    projection: any
    radius: any
    svg: any
    div: any //For the tooltip on the bubble
    initialLoad: boolean
    elemConfig: any //For the element scale and translation configurtion

    constructor (private _geoservice: GeoDataService) {
        this.initialLoad = true; // To load the historical data
    }

    ngOnInit() {
        this.generateMap();

        let that = this;

        this._geoservice.socketData.subscribe( (value: HubNames[]) => {
            if(value) {
                value.sort(function(a, b) {
                    return b.total - a.total;
                });
                if(that.initialLoad) {
                    value.forEach( ( hubItem ) => {
                        hubItem.uid = that.slugify(hubItem.name); 
                        this.plotBubbles(hubItem);
                    });
                    that.initialLoad = false;
                } else{
                    if (this.svg) {
                        value.forEach(element => {
                            if(element.isNew) {
                                let elemId = element.uid;
                                this.svg.select("g#"+elemId).remove();
                                this.plotBubbles(element);
                            }
                        });
                    }
                }
            }
        });
    }

    slugify(arg: string) {
        return arg.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    getElementDetails (divId: string, height, width) {
        let scale, translateConfig, id;
        switch(divId) {
            case 'geo-central-division': translateConfig = [width/2 * -0.4, height/2 * -0.9];
                scale=1500;
                id="central-division";
                break;
            case 'geo-ne-division': translateConfig = [width/2 * -0.4, height/1.7];
                scale=900;
                id="ne-division";
                break;
            case 'geo-west-division': translateConfig = [width/1.4, height/1.8];
                scale=750;
                id="west-division";
                break;
            default: translateConfig = [width / 2.3, height / 2];
                scale = 1000;
                id="main-geo-chart";
                break; 
        }

        let elementDetails = {
            id: id,
            scale: scale,
            translateConfig: translateConfig
        };

        return elementDetails;
    }

    generateMap() {
        let that  = this;
        
        let zoomClick = 1;

        var width = this.width,
            height = this.height,
            id = this.divId,
            active = d3.select(null),
            center = [width / 2, height / 2];
        
        this.elemConfig = this.getElementDetails(this.divId, this.height, this.width);

        let radius = d3.scaleSqrt()
            .domain([100, 10000])
            .range([15, 50]);

        let projection = d3.geoAlbersUsa() // updated for d3 v4
            .scale(this.elemConfig.scale)
            .translate(this.elemConfig.translateConfig);
        
        let zoom = d3.zoom()
            .scaleExtent([1, 4])
            .on("zoom", zoomed);

        let path = d3.geoPath() // updated for d3 v4
            .projection(projection);

        let svg = d3.select("#"+id)
            .append("div")
            .classed("svg-container", true).append("svg")
            .attr("width", width)
            .attr("height", height + 100)
            .attr("id", this.elemConfig.id)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 "+width+ " " + height)
            .classed("svg-content-responsive", true)
            .on("click", stopped, true);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        var g = svg.append("g");

        svg
            .call(zoom)
            .on("mousedown.zoom", null)
            .on("mousewheel.zoom", null)
            .on("dblclick.zoom", null); 
            // .call(zoom.event); // not in d3 v4

        this._geoservice.generateUsCoordinates().subscribe(us => {
 
        g.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", "feature");
            // .on("click", clicked);

        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")") 
            .attr("d", path);
        });

        let legendPlace: any;
        if(this.elemConfig.id == "main-geo-chart") {
            legendPlace = {
                x: (width-200),
                y: (height/1.8)
            }
        } else {
            legendPlace = {
                x: (width-50),
                y: (height/1.8)
            }
        }

        let zoomButtons = svg.selectAll(".button")
            .data(['zoom_in', 'zoom_out'])
            .enter()
            .append("g")
            .attr("class", "button")
            .attr("id", function(d){return d+that.elemConfig.id})
            .attr("transform", "translate(" + legendPlace.x + "," + legendPlace.y + ")");

        zoomButtons.append("rect")
            .attr("x", "10")
            .attr("y", function(d,i){
                return 10 + 30*i
            })
            .attr("width", 25)
            .attr("height", 25);

        zoomButtons.append("text")
            .attr("x", function(d, i) {
                return "19";
            })
            .attr("y", function(d,i){
                return 23 + 28*i
            })
            .attr("dy", ".35em")
            .text( function (d, i) {
                return i ? "-" : "+";
            });

        /** Zoom In Button Click event */
        d3.selectAll("#zoom_in"+that.elemConfig.id).on("click", function(d) {
            if( that.elemConfig.id === "main-geo-chart" ) {
                d3.selectAll(".legend").style("display", "none");
            }
            zoom.scaleBy(svg, 1.5);
            svg.call(zoom)
                .on("dblclick.zoom", null);
            if(zoomClick < 3) {
                zoomClick++;
            }
        });

        d3.selectAll("#zoom_out"+that.elemConfig.id).on("click", function(d) {
            // if( that.elemConfig.id === "main-geo-chart" )
            //     d3.select(".legend").style("display", "block");
            zoom.scaleBy(svg, 0.5);
            if(zoomClick > 2) {
                zoomClick--;
            } else {
                zoomClick = 1;
                reset();
            }
        });

        this.div = d3.select("body").append("div")
            .attr("class", "geotooltips")
            .style("display", "none");

        function clicked(d) {
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(svg).classed("active", true);
            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            that.elemConfig.translateConfig = translate;
            that.elemConfig.scale = scale;

            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
        }

        function reset() {
            active.classed("active", false);
            active = d3.select(null);
            svg.transition()
                .duration(750)
                .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4\
            svg
            .call(zoom)
            .on("mousedown.zoom", null)
            .on("mousewheel.zoom", null)
            .on("dblclick.zoom", null); 
            d3.selectAll(".legend").style("display", "block");
        }

        function zoomed() {
            g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
            g.attr("transform", d3.event.transform); // updated for d3 v4
            d3.select("#"+id).selectAll(".bubble")
                .attr("transform", d3.event.transform);
        }

        // If the drag behavior prevents the default click,
        // also stop propagation so we don’t click-to-zoom.
        function stopped() {
            if (d3.event.defaultPrevented) d3.event.stopPropagation();
        }

        this.svg = svg;
        if( this.elemConfig.id === "main-geo-chart" )
        this.plotLegend(width, height, 2000, 0);
    }

    plotBubbles (bubbleData) {
        let that = this;
        let width = 960,
            height = 500;
        
        let projection = d3.geoAlbersUsa() // updated for d3 v4
            .scale(this.elemConfig.scale)
            .translate(this.elemConfig.translateConfig);
        
        let radius = d3.scaleSqrt()
            .domain([100, 10000])
            .range([15, 50]);

        let bubbleTooltip = that.getTooltipInfo(bubbleData);

        if(bubbleData.lon && bubbleData.lat && bubbleData.total > 0) {
            bubbleData.coords = [(bubbleData.lon), (bubbleData.lat)];
            this.svg.append("g")
            .attr("class", "bubble")
            .attr("id", bubbleData.uid)
            .selectAll("circle")
            .data([bubbleData]).enter()
            .append("circle")
            .attr("cx", function (d) {
                 return projection(d.coords)[0]; 
            })
            .attr("cy", function (d) { 
                return projection(d.coords)[1];
            })
            .attr("r", function(d) {
                return radius(d.total); 
            })
            .attr("id", function(d) {
                if(d.uid) return d.uid+'-'+that.elemConfig.id; 
            })
            .attr("class", function(d) {
                let className = d.isNew ? 'hvr-pulse newItem' : 'hvr-pulse';
                that.elemConfig.id=="west-division" ? d.isNew = false : '';
                setTimeout(function() {
                     d3.selectAll("#"+d.uid+'-'+that.elemConfig.id).attr("class", "hvr-pulse");
                }, 3000);
                return className;
            })
            .on("mouseover", function(d) {
                that.div.transition()
                    .duration(200)
                    .style("display", "block");
                let left = (d3.event.pageX + 5);
                let top = (d3.event.pageY + 20);
                
                // To fix the issue of tooltip showing beyond container
                if(d3.event.pageX > 1200) {
                    left = (d3.event.pageX -150);
                }
                if(d3.event.pageY > 500) {
                    top = (d3.event.pageY - 155);
                }

                //Setting the position of tooltip
                that.div.html(bubbleTooltip)
                    .style("left", left + "px")
                    .style("top", top + "px");
            })
            .on("mouseout", function(d) {
                that.div.transition()
                    .duration(500)
                    .style("display", "none");
            });
            // legendLabelMin += 1;
        }
    }

    getTooltipInfo(bubbleData) {
        return `
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
                    <strong> Total<sup>1</sup>: </strong><span class="float-right">` + bubbleData.total + `</span>
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Outside Headend<sup>2</sup>: </strong><span class="float-right">` + bubbleData.outsideHeadEnd + `</span>
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Within Headend<sup>3</sup>: </strong><span class="float-right">` + bubbleData.withinHeadEnd + `</span>
                </li>
                <li class="geoDataToolTipItem">
                    <strong> FTA / FiberNodeIssue<sup>4</sup>: </strong><span class="float-right">` + bubbleData.fiberNodeIssue + `</span>
                </li>
            </ul>
        `;
    }

    plotLegend (width, height, legendMax, legendMin) {

        let domainRange, dataRange;

        if( legendMax >= 1000 && legendMax < 1000000 ){
            domainRange = [100, 10000];
            dataRange = [2000, 500 , legendMin];
        } else {
            domainRange = [100, 10000];
            dataRange = [2000, 500 , legendMin];
        }

        var radius = d3.scaleSqrt()
                .domain(domainRange)
                .range([15, 50]);

        var legend = this.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width - 175) + "," + (height / 1.9) + ")")
                .selectAll("g")
                .data(dataRange)
                .enter().append("g");

        legend.append("circle")
            .attr("cy", function(d) { return -radius(d); })
            .attr("r", radius);

        legend.append("text")
            .attr("y", function(d) { return -2 * radius(d); })
            .attr("dy", "1.2em")
            .text(d3.format(".1s"));
        
        legend.append('rect')
             .attr('width', 890)
             .attr('height', 0.2)
             .attr('x', -900)
             .attr('y', 230)
             .style('fill', '#bfbfbf')
             .style('stroke', '#bfbfbf');

        // Code to add Static D3 Legend text to the Geo-Graph  
        legend.append('text')
             .attr('x', -700 )
             .attr('y', 245 )
             .text( 'Total: Sum of all Mismatch conditions');

        // Code to add Static D3 Legend text to the Geo-Graph  
        legend.append('text')
             .attr('x', -410)
             .attr('y', 260)
             .text('Outside Headend: Sum of (Single CMTS comparison - CMTS Mismatch, Headend Mismatch and Multiple CMTS comparison - CMTS Mismatch, Headend Mismatch)');

        // Code to add Static D3 Legend text to the Geo-Graph    
        legend.append('text')
             .attr('x', -430)
             .attr('y', 275)
             .text('Within Headend: Sum of (Single CMTS comparison - CMTS Mismatch, Headend Match and Multiple CMTS comparison  - CMTS Mismatch, Headend Match)');
            
        // Code to add Static D3 Legend text to the Geo-Graph      
        legend.append('text')
             .attr('x', -398)
             .attr('y', 290)
             .text('FTA Searched due to Account and/or FiberNode issues: Sum of Multiple CMTS comparison (CMTS Mismatch, Headend Mismatch and CMTS Mismatch, Headend Match)');
    }
}

