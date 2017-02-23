import {Component, ViewEncapsulation, NgModule, animate, state, style, transition, trigger} from '@angular/core';
import { Scale } from './realtime-scale.interface';
import { GeoDataService } from '../services/geoservice';
import { HubNames } from '../geodata/hubnames.model.ts';

declare var d3: any;

@Component({
    selector: 'realtime-scale',
    styleUrls: ['./realtime-scale.component.css'],
    templateUrl: './realtime-scale.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [trigger(
        'openClose',
        [
            state('collapsed, void', style({ width: 0 })),
            state('normal', style({ width: '*' })),
            state('expanded', style({ width: '98%' })),
            transition('normal => collapsed', [animate(500, style({ width: '0' })), animate(500)]),
            transition('collapsed => normal', [animate(500, style({ width: '49%' })), animate(500)]),
            transition('normal => expanded', [animate(500, style({ width: '98%' })), animate(500)]),
            transition('expanded => normal', [animate(500, style({ width: '49%' })), animate(500)])
        ])
    ]
})

export class RealtimeScaleComponent {

    minuteState: string;
    secondsState: string;

    /**
     * Holds the full list of
     * points to be plotted
     */
    data: any;

    /**
     * Scale properties
     * seconds & minute
     */
    secScaleProps: Scale = {
        type        : 'seconds',
        width       : 350,
        height      : 30,
        barWidth    : 4,
        barHeight   : 30
    };

    minScaleProps: Scale = {
        type        : 'minute',
        width       : 350,
        height      : 30,
        barWidth    : 4,
        barHeight   : 30
    };

    /**
     * Scale objects
     * seconds & minute
     */
    secondsScale: any;
    minuteScale: any;
    
    constructor(private geoDataService: GeoDataService) { }

    slideRight(event) {

        event.preventDefault();

        if (this.minuteState == "normal" || undefined == this.minuteState) {
            this.minuteState = 'expanded';
            this.secondsState = 'collapsed';
        } else if (this.minuteState == "collapsed") {
            this.minuteState = 'normal';
            this.secondsState = 'normal';
        }
    }

    slideLeft(event) {

        event.preventDefault();

        if (this.minuteState == "normal" || undefined == this.minuteState) {
            this.minuteState = 'collapsed';
            this.secondsState = 'expanded';
        } else if (this.minuteState == "expanded") {
            this.minuteState = 'normal';
            this.secondsState = 'normal';
        }
    }

    /**
     * Generate data
     * for realtime scale
     */
    generateData(hub: any) {

        // hub.time = +new Date();

        this.data.seconds.push(hub);
    }

    /**
     * Initialize the scale
     * build the responsive svg
     * and push to to the container
     */
    initScale(container: string, scaleProps: Scale) : any {

        /**
         * Building the chart
         */
        let chart = d3.select(container)
            .append('div')
            //container class to make it responsive
            .classed('scale-container', true)
            .append('svg:svg')
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', '0 0 ' + scaleProps.width + ' ' + 50) // scaleProps.height
            //class to make it responsive
            .classed('scale-content-responsive', true);

        return chart;
    }

    /**
     * Render scale initial data
     * and events
     * if it's available
     */
    renderScaleData(scale: any, scaleProps: Scale, items: Array<any>) : void {

        // let that = this;

        let labels: Array<any>;

        if (scaleProps.type == 'seconds') {

            labels = [

                {label: '............ -60 sec'},
                {label: '-45 sec'},
                {label: '-30 sec'},
                {label: '-15 sec'},
                {label: '0 sec'}
            ];

        } else {

            labels = [

                {label: '-60 min'},
                {label: '-50 min'},
                {label: '-40 min'},
                {label: '-30 min'},
                {label: '-20 min'},
                {label: '-10 min'},
                {label: '0 min'}
            ];
        }

        let xBand: any = d3.scaleBand().rangeRound([-45, scaleProps.width+45]);
        let xAxis: any = d3.axisBottom(xBand).ticks(labels.length);

        xBand.domain(labels.map(function(d) {
            return d.label;
        }));

        scale.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + scaleProps.height + ')')
            .call(xAxis);

        // scale.selectAll(".axis text").attr("text-anchor", "right");  

        /**
         * Building up the initial scale
         * start: current time - 60 sec
         * end: current time
         */
        let multiplier = (scaleProps.type == 'seconds') ? 1 : 60;
        let end = +new Date();
        let start = end - (multiplier * 60 * 1000);

        let x = d3.scaleTime()
            .domain([start, end])
            .range([0, scaleProps.width]);
        
        /**
         * Plotting the initial points
         * (rectangular bars) into the svg
         */
        scale.selectAll('rect')
            .data(items)
            .enter().append('svg:rect')
            .attr('x', function (d, i) { return x(d.time); })
            .attr('y', 0)
            .attr('class', 'rect')
            .attr('fill', '#dc4223')
            .attr('width', scaleProps.barWidth)
            .attr('height', scaleProps.barHeight)
            // .on('mouseover', function (item) {
                
            //     d3.select('#' + item.uid).classed('newItem', true);
                
            //     let tip: any = d3.select('.tip');
                
            //     tip.transition()
            //         .duration(200)
            //         .style('opacity', .9);
                
            //     tip.html(that.getTooltipData(item))
            //         .style('left', (d3.event.pageX + 5) + 'px')
            //         .style('top', (d3.event.pageY + 20) + 'px');

            // })
            // .on('mouseout', function (item) {
                
            //     let tip: any = d3.select('.tip');
                
            //     tip.transition()
            //         .duration(200)
            //         .style('opacity', 0);
            // });
    }

    /**
     * Plotting the new points
     * (rectangular bars) into the svg
     * in every seconds/minute
     */
    tick(scale: any, scaleProps: Scale, items: Array<any>) : void {

        // let that = this;

        let multiplier  = scaleProps.type == 'seconds' ? 1 : 60;
        let end         = +new Date();
        let start       = end - (multiplier * 60 * 1000);

        let x = d3.scaleTime()
            .domain([start, end])
            .range([0, scaleProps.width]);

        x.domain([start, end]);

        let bars = scale.selectAll('rect').data(items);

        bars.exit().remove();

        bars.enter().append('rect')
            .attr('x', function (d, i) { return x(d.time); })
            .attr('y', 0)
            .attr('class', 'rect')
            .attr('fill', '#dc4223')
            .attr('width', scaleProps.barWidth)
            .attr('height', scaleProps.barHeight)
            // .on('mouseover', function (item) {
                
            //     d3.select('#' + item.uid).classed('newItem', true);
                
            //     let tip: any = d3.select('.tip');
                
            //     tip.transition()
            //         .duration(200)
            //         .style('opacity', .9);
                
            //     tip.html(that.getTooltipData(item))
            //         .style('left', (d3.event.pageX + 5) + 'px')
            //         .style('top', (d3.event.pageY + 20) + 'px');

            // })
            // .on('mouseout', function (item) {
                
            //     let tip: any = d3.select('.tip');
                
            //     tip.transition()
            //         .duration(200)
            //         .style('opacity', 0);
            // });

        bars.transition()
            .duration(1000)
            .attr('x', function (d, i) { return x(d.time); });
    }

    /**
     * Generate tooltip data
     */
    getTooltipData(item: any) : string {

         return `
            <ul class="geoDataToolTip">
                <li class="geoDataToolTipItem">
                    <strong> Hub : </strong> ` + item.name + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Region : </strong> ` + item.market + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Division : </strong> ` + item.division + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Total : </strong> ` + item.total + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Outside Headend : </strong> ` + item.outsideHeadEnd + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> Within Headend : </strong> ` + item.withinHeadEnd + ` 
                </li>
                <li class="geoDataToolTipItem">
                    <strong> FTA / FiberNodeIssue : </strong> ` + item.fiberNodeIssue + ` 
                </li>
            </ul>
        `;
    }

    /**
     * Initialize
     * scale component
     */
    ngOnInit() {

        // d3.select('body').append('div')
        //     .attr('class', 'tip')
        //     .style('opacity', 0);

        /**
         * Subscribe
         * to the realtime data
         */
        this.geoDataService.socketData.subscribe((value: HubNames[]) => {

            value.forEach(element => {
                element.isNew ? this.generateData(element) : '';
            });
        });

        /**
         * Holds the full list of
         * points to be plotted
         */
        this.data = {
            seconds: [],
            minute: []
        };

        /**
         * Initial set of data for
         * first 60 seconds/1 hour
         * should come from the server
         */
        // for (let i = 0; i < 60; i++) {

        //     if (Math.random() > 0.8) {

        //         let date = +new Date();
        //         date -= (i * 1000);

        //         this.data.seconds.push({
        //             time: date,
        //             name: 'SecPoint '+i
        //         });
        //     }
        // }

        for (let i = 0; i < 60; i++) {

            if (Math.random() > 0.8) {

                let date = +new Date();
                date -= (i * 1000 * 60);

                this.data.minute.push({
                    time: date,
                    name: 'MinPoint '+i
                });
            }
        }
        
        /**
         * Build seconds scale
         */
        this.secondsScale = this.initScale('.geo-scale-seconds', this.secScaleProps);

        /**
         * Render seconds scale
         * initial data
         */
        this.renderScaleData(this.secondsScale, this.secScaleProps, this.data.seconds);


        /**
         * Build minute scale
         */
        this.minuteScale = this.initScale('.geo-scale-minute', this.minScaleProps);

        /**
         * Render minute scale
         * initial data
         */
        this.renderScaleData(this.minuteScale, this.minScaleProps, this.data.minute);

        /**
         * Shifting the bar
         * in every seconds
         */
        let i = 0;
        let that = this;

        setInterval(function () {

            i++;
            
            if (Math.random() > 0.8) {

                /**
                 * This need to be from
                 * the socket
                 */
                // that.data.seconds.push({
                //     time: +new Date(),
                //     name: 'SecPoint '+i
                // });

                if (i == 60) {

                    /**
                     * This need to be from
                     * the socket
                     */
                    that.data.minute.push({
                        time: +new Date(),
                        name: 'MinPoint '+i
                    });
                }
            }

            /**
             * Remove the first entry
             * if the total data length/size
             * exceeds certain limit
             */
            if (that.data.seconds.length > 100) {
                that.data.seconds.shift();
            }
            
            that.tick(that.secondsScale, that.secScaleProps, that.data.seconds);

            if (i == 60) {

                /**
                 * Remove the first entry
                 * if the total data length/size
                 * exceeds certain limit
                 */
                if (that.data.minute.length > 100) {
                    that.data.minute.shift();
                }

                that.tick(that.minuteScale, that.minScaleProps, that.data.minute);

                i = 0;
            }

        }, 1000);

    }
}


/*
collapsed
expanded
normal
*/