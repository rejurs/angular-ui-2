import {Component, ViewEncapsulation, NgModule, animate, state, style, transition, trigger} from '@angular/core';
import { Scale } from './realtime-scale.interface';
import { GeoDataService } from '../services/geoservice';
import { HubNames } from '../geodata/hubnames.model.ts';

import * as _ from 'lodash';

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

    minuteState : string;
    secondsState: string;

    /**
     * Holds the full list of
     * points to be plotted
     * in the scale
     */
    data: any;

    /**
     * Scale properties
     * seconds & minute
     */
    secScaleProps: Scale = {
        type        : 'seconds',
        width       : '100%',
        height      : '75px',
        barWidth    : '4px',
        barHeight   : '55px'
    };

    minScaleProps: Scale = {
        type        : 'minute',
        width       : '100%',
        height      : '75px',
        barWidth    : '4px',
        barHeight   : '55px'
    };

    /**
     * Scale objects
     * seconds & minute
     */
    secondsScale    : any;
    minuteScale     : any;
    
    constructor(private geoDataService: GeoDataService) { }

    /**
     * Slide right
     */
    slideRight(event) {

        event.preventDefault();

        if (this.minuteState == 'normal' || undefined == this.minuteState) {
            this.minuteState    = 'expanded';
            this.secondsState   = 'collapsed';
        } else if (this.minuteState == 'collapsed') {
            this.minuteState    = 'normal';
            this.secondsState   = 'normal';
        }

        this.initAxis(this.secondsScale, this.secScaleProps);
        this.initAxis(this.minuteScale, this.minScaleProps);
    }

    /**
     * Slide left
     */
    slideLeft(event) {

        event.preventDefault();

        if (this.minuteState == 'normal' || undefined == this.minuteState) {
            this.minuteState    = 'collapsed';
            this.secondsState   = 'expanded';
        } else if (this.minuteState == 'expanded') {
            this.minuteState    = 'normal';
            this.secondsState   = 'normal';
        }

        this.initAxis(this.secondsScale, this.secScaleProps);
        this.initAxis(this.minuteScale, this.minScaleProps);
    }

    /**
     * Generate data
     * for realtime scale
     */
    generateData(item: any) : void {

        if (_.isUndefined(item)) { return; }
        
        this.processData(item);
    }

    /**
     * Process the data
     * and assign it to seconds & minute
     */
    processData(item: any) : void {

        /**
         * Generate the key
         */
        let t: any = new Date(item.time);
        let k: any = t.getHours() + '-' + t.getMinutes();

        item.key = k;

        /**
         * Insert seconds data
         */
        this.data.seconds.push(item);


        if (_.findIndex(this.data.minute, {'key': k}) == -1) {

            /**
             * Insert minutues data
             */
            t -= (t % (1000*60));   // reset min-seconds

            item.time = t;

            this.data.minute.push(item);

            // console.log('new', k, item.time);

        } else {

            /**
             * Update minutues data
             */
            let e: any = _.find(this.data.minute, {'key': k});
            let i: any = _.indexOf(this.data.minute, e);
            
            e = this.updateCounts(e, item);

            this.data.minute.splice(i, 1, e);

            // console.log('update', k, this.data.minute);
        }
    }

    /**
     * Update the overall counts
     * in each category
     * 1600112 | 1600117 | 1600118 | 1600119
     */
    updateCounts(e: any, item: any) : any {

        /**
         * List of available error codes
         */
        let keys: number[] = [1600112, 1600117, 1600118, 1600119];

        for (let k of keys) {

            if (_.has(e, k)) {
                e[k] = _.has(item, k) ? parseInt(e[k] + item[k]) : parseInt(e[k]);
            } else {
                e[k] = 0;
            }
        }

        return e;
    }

    /**
     * Initialize the scale
     * build the responsive svg
     * and push to the container
     */
    initScale(container: string, scaleProps: Scale) : any {

        /**
         * Building the chart
         */
        let chart = d3.select(container)
                        .append('svg:svg')
                        .attr('width', scaleProps.width)
                        .attr('height', scaleProps.height);
        
        // create axis
        this.initAxis(chart, scaleProps);

        return chart;
    }

    /**
     * Build and attach
     * the x-axis and it's labels
     */
    initAxis(chart: any, scaleProps: Scale) : void {

        /**
         * Build the labels
         * onto the x axis
         */
        let labels  : Array<number>;    // full list of labels
        let show    :  Array<number>;   // list of labels to be displayed
        let extra    : string;           // extra string to be displayed anong with the label

        if (scaleProps.type == 'seconds') {

            labels  = _.range(-60, 0);
            show    = [-60, -45, -30, -15, 0];
            extra   = ' sec';

        } else {

            labels  = _.range(-60, 0);
            show    = [-60, -45, -30, -15, 0];
            extra   = ' min';
        }

        chart.selectAll('.axis').remove();

        setTimeout(function () {

            /**
             * Build the axis
             * and dynamic labels
             */
            let eid: string = (scaleProps.type == 'seconds') ? 'sec' : 'min';

            let graphWidth: any = document.getElementById(eid).offsetWidth;

            let xBand: any = d3.scaleBand()
                                .range([0, graphWidth])
                                .domain(labels);
            
            let xAxis: any = d3.axisBottom(xBand)
                                .ticks(labels.length)
                                .tickFormat(function(d) {
                                    
                                    let x: string = _.includes([-60, 0], d) ? '' : extra;

                                    return _.includes(show, d) ? (d + x) : null;
                                });
            
            chart.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, 55)')
                .call(xAxis);
            
        }, 1000);
    }
 
    /**
     * Render scale initial data
     * and events
     * if it's available
     */
    renderScaleData(scale: any, scaleProps: Scale, items: Array<any>) : void {
        
        /**
         * Building up the initial scale
         * start: current time - 60 sec
         * end: current time
         */
        let multiplier: number  = (scaleProps.type == 'seconds') ? 1 : 60;
        let end: number         = +new Date();
        let start: number       = end - (multiplier * 60 * 1000);

        let x: any = d3.scaleTime()
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
            .attr('height', scaleProps.barHeight);

        /**
         * Attach events to bars
         */
        if (scaleProps.type == 'minute') {
            this.setActions(scale);
        }
    }

    /**
     * Plotting the new points
     * (rectangular bars) into the svg
     * in every seconds/minute
     */
    tick(scale: any, scaleProps: Scale, items: Array<any>) : void {

        let multiplier: number  = scaleProps.type == 'seconds' ? 1 : 60;
        let end: number         = +new Date();
        let start: number       = end - (multiplier * 60 * 1000);

        let x: any = d3.scaleTime()
                        .domain([start, end])
                        .range([0, scaleProps.width]);
        
        // x.domain([start, end]);

        let bars: any = scale.selectAll('rect').data(items);

        bars.exit().remove();

        bars.enter().append('rect')
            .attr('x', function (d, i) { return x(d.time); })
            .attr('y', 0)
            .attr('class', 'rect')
            .attr('fill', '#dc4223')
            .attr('width', scaleProps.barWidth)
            .attr('height', scaleProps.barHeight);
        
        /**
         * Attach events to bars
         */
        if (scaleProps.type == 'minute') {
            this.setActions(scale);
        }

        bars.transition()
            .duration(1000)
            .attr('x', function (d, i) { return x(d.time); });
    }

    /**
     * Generate tooltip data
     */
    getTooltipData(item: any) : string {

         return `
            <ul class='geoDataToolTip'>
                <li class='geoDataToolTipItem'>
                    <strong>  1600112 : </strong> ` + (item[1600112] | 0) + ` 
                </li>
                <li class='geoDataToolTipItem'>
                    <strong>  1600117 : </strong> ` + (item[1600117] | 0) + ` 
                </li>
                <li class='geoDataToolTipItem'>
                    <strong>  1600118 : </strong> ` + (item[1600118] | 0) + ` 
                </li>
                <li class='geoDataToolTipItem'>
                    <strong>  1600119 : </strong> ` + (item[1600119] | 0) + ` 
                </li>
            </ul>
        `;
    }

    /**
     * Set actions
     * mouseover | mouseout
     * for individual bars
     */
    setActions(scale: any) : void {

        let that: any = this;

        scale.selectAll('rect').on('mouseover', function (item) {
            
            // d3.select('#' + item.uid).classed('newItem', true);
            
            let tip: any = d3.select('.tip');
            
            tip.transition()
                .duration(200)
                .style('display', 'block');
            
            tip.html(that.getTooltipData(item))
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px');

        })
        .on('mouseout', function (item) {
            
            let tip: any = d3.select('.tip');
            
            tip.transition()
                .duration(200)
                .style('display', 'none');
        });
    }

    /**
     * Initialize
     * scale component
     */
    ngOnInit() {

        d3.select('body').append('div').attr('class', 'tip');

        /**
         * Subscribe
         * to the realtime data
         */
        this.geoDataService.realTimeSocketData.subscribe((value: any[]) => {

            value.forEach(element => {
                this.generateData(element);
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
        
        // this.buildInitialDummyData();

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
        let i: number = 0;
        let that: any = this;

        setInterval(function () {

            i++;
            
            // that.buildSocketDummyData(i);

            /**
             * Remove the first entry
             * if the total data length/size
             * exceeds certain limit [100]
             */
            if (that.data.seconds.length > 100) {
                that.data.seconds.shift();
            }
            
            that.tick(that.secondsScale, that.secScaleProps, that.data.seconds);

            if (i == 60) {

                /**
                 * Remove the first entry
                 * if the total data length/size
                 * exceeds certain limit [100]
                 */
                if (that.data.minute.length > 100) {
                    that.data.minute.shift();
                }

                that.tick(that.minuteScale, that.minScaleProps, that.data.minute);

                i = 0;

                // console.log('minute');
            }

        }, 1000);
        
        /**
         * Redraw xAxis
         * on window resize
         */
        window.addEventListener('resize', function () {

            that.initAxis(that.secondsScale, that.secScaleProps);
            that.initAxis(that.minuteScale, that.minScaleProps);
        });
    }

    /**
     * Generate dummy data
     * for realtime scale
     */
    buildSocketDummyData(i: number) : void {

        if (Math.random() > 0.9) {

            let keys: number[] = [1600112, 1600117, 1600118, 1600119];

            let item: Object = {
                name    : 'SecPoint ' + i,
                time    : +new Date()
            };

            item[_.sample(keys)] =  _.random(5);

            this.generateData(item);
        }
    }

    /**
     * Generate dummy data
     * for initial scale
     */
    buildInitialDummyData() : void {

        /**
         * Initial set of data for
         * first 60 seconds/1 hour
         * should come from the server
         */
        for (let i = 0; i < 60; i++) {

            this.buildSocketDummyData(i);        
        }
    }
}