import {Component, OnInit, ViewEncapsulation, animate, state, style, transition, trigger} from '@angular/core';
import { ScaleProps } from './realtime-scale.interface';
import { GeoDataService } from '../services/geoservice';
import { HubNames } from '../geodata/hubnames.model.ts';

import { Socket } from './realtime-scale.service';

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
    ],
    providers: [Socket]
})

export class RealtimeScaleComponent implements OnInit {

    /**
     * Scale states
     * live & history
     * for expand/collapse actions 
     */
    liveState       : string;
    historyState    : string;

    /**
     * Scale objects
     * live & history
     */
    liveScale       : any;
    historyScale    : any;

    /**
     * Scale properties
     * seconds / live
     */
    lScaleProps: ScaleProps = {

        type        : 'live',
        width       : '100%',
        height      : '75px',
        barWidth    : '4px',
        barHeight   : '55px',
        group       : 1,
        labels      : _.range(-60, 0),
        show        : [-60, -45, -30, -15, 0],
        showAs      : ['', '-45 sec', '-30 sec', '-15 sec', '']
    };

    /**
     * List of history scale types
     * this key will be used for
     * all mapping/assoc process
     */
    hScaleTypes: any[] = _.map(_.range(1, 25), function (item) { return item + '_hrs'; });

    /**
     * Properties for all 24
     * different types of history scales
     */
    hScaleProps: any[] = [];
    
    /**
     * Active history scale type
     */
    activeHScale: string = '1_hrs';

    /**
     * Holds the full list of
     * points to be plotted
     * in the scale
     */
    data: any;

    /**
     * Constructor
     * initialize Socket service
     */
    constructor(private geoDataService: GeoDataService, private socket: Socket) {

        /**
         * Holds the full list of
         * points to be plotted
         */
        this.data = {
            live: [],
            history: []
        };

        let store: any = JSON.parse(localStorage.getItem('store'));

        /**
         * Get live data
         * from localStorage
         */
        this.data.live = _.get(store, 'live', []);
        
        let that = this;

        /**
         * Build the 24 different
         * scale properties
         */
        _.forEach(this.hScaleTypes, function(scaleType){

            let g = _.parseInt(scaleType);  // grouping of minutes
            let b = _.round((g * 60) / 4);  // block of labels in scale

            that.hScaleProps[scaleType] = that.getProps({

                type        : 'history',
                width       : '100%',
                height      : '75px',
                barWidth    : '4px',
                barHeight   : '55px',
                group       : g,
                labels      : _.range(-(g * 60), 0),
                show        : [-(b * 4), -(b * 3), -(b * 2), -(b), 0],
                showAs      : ['', that.getHM(b * 3), that.getHM(b * 2), that.getHM(b * 1), '']
            });
            
            /**
             * Get history data
             * from localStorage
             */
            that.data.history[scaleType] = _.get(store, 'history[' + scaleType + ']', []);
        });

        /**
         * Save the data to local storage
         */
        localStorage.setItem('store', JSON.stringify(this.data));

        // console.log(store);
    }

    /**
     * Get hours/minutes
     * split-up
     */
    getHM(x: number) : string {

        let h = _.floor(x / 60);
        let m = x % 60;

        return (h == 0) ? '-' + m + ' min' : '-' + h + ':' + m + ' hrs';
    }

    /**
     * Get scale property
     */
    getProps(props: any) : ScaleProps {

        let prop: ScaleProps = {

            type        : props.type,
            width       : props.width,
            height      : props.height,
            barWidth    : props.barWidth,
            barHeight   : props.barHeight,
            group       : props.group,
            labels      : props.labels,
            show        : props.show,
            showAs      : props.showAs
        };

        return prop;
    }

    /**
     * Slide right
     */
    slideRight(event) {

        event.preventDefault();

        if (this.historyState == 'normal' || undefined == this.historyState) {
            this.historyState   = 'expanded';
            this.liveState      = 'collapsed';
        } else if (this.historyState == 'collapsed') {
            this.historyState   = 'normal';
            this.liveState      = 'normal';
        }

        this.initAxis(this.liveScale, this.lScaleProps);
        this.initAxis(this.historyScale, this.hScaleProps[this.activeHScale]);
    }

    /**
     * Slide left
     */
    slideLeft(event) {

        event.preventDefault();

        if (this.historyState == 'normal' || undefined == this.historyState) {
            this.historyState   = 'collapsed';
            this.liveState      = 'expanded';
        } else if (this.historyState == 'expanded') {
            this.historyState   = 'normal';
            this.liveState      = 'normal';
        }

        this.initAxis(this.liveScale, this.lScaleProps);
        this.initAxis(this.historyScale, this.hScaleProps[this.activeHScale]);
    }

    /**
     * Get the nearest
     * round value of minute
     * with respect to the given interval
     */
    roundTo (min: number, interval: number) : number {
        
        return (_.ceil(min / interval) * interval);
    }

    /**
     * Process the data
     * and assign it to live & history
     */
    processData(item: any) : void {

        if (_.isUndefined(item)) { return; }

        /**
         * Insert live data
         */
        this.data.live.push(item);

        /**
         * Remove the first entry
         * if the total data length/size
         * exceeds certain limit [300]
         */
        if (this.data.live.length > 300) {

            this.data.live = _.drop(this.data.live, 200);

            /**
             * Build live scale
             */
            this.liveScale = this.initScale('.geo-scale-live', this.lScaleProps);

            /**
             * Render live scale
             * initial data
             */
            this.renderScaleData(this.liveScale, this.lScaleProps, this.data.live);
        }

        let that = this;

        /**
         * Set history data for
         * all scale types [1-24 hrs]
         */
        _.forEach(this.hScaleTypes, function (scaleType) {

            that.setHistoryData(scaleType, item); 
        });

        /**
         * Save the data to local storage
         */
        localStorage.setItem('store', JSON.stringify(this.data));
    }

    /**
     * Set history data
     */
    setHistoryData(scaleType: string, item: any) : void {

        let x: any = _.clone(item);

        /**
         * Generate the key
         */
        let t: any = new Date(x.time);

        let key: string = t.getHours() + '-' + this.roundTo(t.getMinutes(), this.hScaleProps[scaleType].group);

        let search = {};
        search[scaleType] = key;

        /**
         * Insert/Update historical data
         */
        if (_.findIndex(this.data.history[scaleType], search) == -1) {

            /**
             * Update scale specific
             * key & time
             */
            let coeff       = 1000 * 60 * this.hScaleProps[scaleType].group;
            x.time          = new Date(Math.round(new Date(x.time).getTime() / coeff) * coeff)
            x[scaleType]    = key;

            this.data.history[scaleType].push(x);

        } else {

            let e: any = _.find(this.data.history[scaleType], search);
            let i: any = _.indexOf(this.data.history[scaleType], e);
            
            x = this.updateCounts(e, x);

            this.data.history[scaleType].splice(i, 1, x);
        }

        /**
         * Remove the first entry
         * if the total data length/size
         * exceeds certain limit [300]
         */
        if (this.data.history[scaleType].length > 300) {

            this.data.history[scaleType] = _.drop(this.data.history[scaleType], 200);

            /**
             * Re-render if it's the
             * active history scale type
             */
            if (this.activeHScale == scaleType) {

                /**
                 * Build history scale
                 */
                this.historyScale = this.initScale('.geo-scale-history-c', this.hScaleProps[scaleType]);

                /**
                 * Render history scale
                 * initial data
                 */
                this.renderScaleData(this.historyScale, this.hScaleProps[scaleType], this.data.history[scaleType]);
            }
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
    initScale(container: string, sProps: ScaleProps) : any {

        /**
         * Remove already existing scales
         */
        d3.select(container).select('svg').remove();

        /**
         * Building the chart
         */
        let chart = d3.select(container)
                        .append('svg:svg')
                        .attr('width', sProps.width)
                        .attr('height', sProps.height);
        
        // create axis
        this.initAxis(chart, sProps);

        return chart;
    }

    /**
     * Build and attach
     * the x-axis and it's labels
     */
    initAxis(chart: any, sProps: ScaleProps) : void {

        chart.selectAll('.axis').remove();

        /**
         * Build the axis
         * and dynamic labels
         */
        setTimeout(function () {

            let graphWidth: any = document.getElementById(sProps.type).offsetWidth;

            let xBand: any = d3.scaleBand()
                                .range([0, graphWidth])
                                .domain(sProps.labels);
            
            let xAxis: any = d3.axisBottom(xBand)
                                .ticks(sProps.labels.length)
                                .tickFormat(function(d) {
                                    
                                    return _.includes(sProps.show, d) ? (sProps.showAs[_.indexOf(sProps.show, d)]) : null;
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
    renderScaleData(scale: any, sProps: ScaleProps, items: Array<any>) : void {
        
        /**
         * Building up the initial scale
         * start: current time - 60 sec
         * end: current time
         */
        let end: number     = +new Date();
        let diff: number    = (sProps.type == 'live') ? (60 * 1000) : (sProps.group * 60 * 60 * 1000)
        let start: number   = end - diff;

        let x: any = d3.scaleTime()
                        .domain([start, end])
                        .range([0, sProps.width]); 
        
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
            .attr('width', sProps.barWidth)
            .attr('height', sProps.barHeight);

        /**
         * Attach events to bars
         * if it's not live scale
         */
        if (sProps.type != 'live') {
            this.setActions(scale);
        }
    }

    /**
     * Plotting the new points
     * (rectangular bars) into the svg
     * in every seconds/minute
     */
    tick(scale: any, sProps: ScaleProps, items: Array<any>) : void {

        let end: number     = +new Date();
        let diff: number    = (sProps.type == 'live') ? (sProps.group * 60 * 1000) : (sProps.group * 60 * 60 * 1000)
        let start: number   = end - diff;

        let x: any = d3.scaleTime()
                        .domain([start, end])
                        .range([0, sProps.width]);
        
        let bars: any = scale.selectAll('rect').data(items);

        bars.exit().remove();

        bars.enter().append('rect')
            .attr('x', function (d, i) { return x(d.time); })
            .attr('y', 0)
            .attr('class', 'rect')
            .attr('fill', '#dc4223')
            .attr('width', sProps.barWidth)
            .attr('height', sProps.barHeight);
        
        bars.transition()
            .duration(1000)
            .attr('x', function (d, i) { return x(d.time); });
        
        /**
         * Attach events to bars
         * if it's not live scale
         */
        if (sProps.type != 'live') {
            this.setActions(scale);
        }
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

        }).on('mouseout', function (item) {
            
            let tip: any = d3.select('.tip');
            
            tip.transition()
                .duration(200)
                .style('display', 'none');
        });
    }

    /**
     * Generate tooltip data
     */
    getTooltipData(item: any) : string {

         return `
            <p> ` + new Date(item.time).toLocaleString('en-US', {timeZone: 'UTC'}) + ` (UTC)</p>
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
     * Update the history scale
     * rerender the values
     */
    onScaleChange(scaleType: any) {

        this.activeHScale = scaleType;

        /**
         * Build history scale
         */
        this.historyScale = this.initScale('.geo-scale-history-c', this.hScaleProps[this.activeHScale]);

        /**
         * Render history scale
         * initial data
         */
        this.renderScaleData(this.historyScale, this.hScaleProps[this.activeHScale], this.data.history[this.activeHScale]);
    }

    /**
     * Get the printable version
     * of history scale type
     */
    getSType(sType: string) : string {
        
        return _.replace(sType, '_hrs', ' h');
    }

    /**
     * Initialize
     * scale component
     */
    ngOnInit() {

        let that: any = this;

        d3.select('body').append('div').attr('class', 'tip');

        // this.socket.connect();

        // this.socket.socketData.subscribe((items: any[]) => {

        //     items.forEach(item => {
        //         that.processData(item);
        //     });
        // });

        /**
         * Subscribe
         * to the realtime data
         */
        this.geoDataService.realTimeSocketData.subscribe((value: any[]) => {

            value.forEach(element => {
                this.processData(element);
            });
        });
        
        /**
         * Build live scale
         */
        this.liveScale = this.initScale('.geo-scale-live', this.lScaleProps);

        /**
         * Render live scale
         * initial data
         */
        this.renderScaleData(this.liveScale, this.lScaleProps, this.data.live);

        /**
         * Build history scale
         */
        this.historyScale = this.initScale('.geo-scale-history-c', this.hScaleProps[this.activeHScale]);

        /**
         * Render history scale
         * initial data
         */
        this.renderScaleData(this.historyScale, this.hScaleProps[this.activeHScale], this.data.history[this.activeHScale]);

        /**
         * Shifting the bar
         * in every seconds
         */
        let i: number = 0;

        setInterval(function () {

            i++;
            
            that.tick(that.liveScale, that.lScaleProps, that.data.live);

            /**
             * Make the history scale move
             * based on the active scale type
             */
            if (i >= (60 * that.hScaleProps[that.activeHScale].group)) {

                that.tick(that.historyScale, that.hScaleProps[that.activeHScale], that.data.history[that.activeHScale]);

                i = 0;
            }

        }, 1000);
        
        /**
         * Redraw xAxis
         * on window resize
         */
        window.addEventListener('resize', function () {

            that.initAxis(that.liveScale, that.lScaleProps);
            that.initAxis(that.historyScale, that.hScaleProps[that.activeHScale]);
        });
    }
}