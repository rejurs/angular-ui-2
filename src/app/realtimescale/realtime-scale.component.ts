import {Component, NgModule, OnInit, animate, state, style, transition, trigger} from '@angular/core';

declare var d3: any;

@Component({
  selector: 'realtime-scale',
  styleUrls: ['./realtime-scale.component.css'],
  templateUrl: './realtime-scale.component.html',
  animations: [trigger(
      'openClose',
      [
        state('collapsed, void', style({width: 0})),
        state('normal', style({width: '*'})),
        state('expanded', style({width: '98%'})),
        transition('normal => collapsed', [animate(500, style({width: '0'})), animate(500)]),
        transition('collapsed => normal', [animate(500, style({width: '49%'})), animate(500)]),
        transition('normal => expanded', [animate(500, style({width: '98%'})), animate(500)]),
        transition('expanded => normal', [animate(500, style({width: '49%'})), animate(500)])
      ])]
})

export class RealtimeScaleComponent {

  minuteState: string;
  secondsState: string;

  x: any;
  chart: any;
  data: any;

  slideRight(event){
    event.preventDefault();
    //this.minuteState = 'normal';
    //console.log(this.secondsState)
    //this.secondsState = 'normal';
    if(this.minuteState == "normal" || undefined == this.minuteState){
      this.minuteState = 'expanded';
      this.secondsState = 'collapsed';
    }
    else if(this.minuteState == "collapsed"){
      this.minuteState = 'normal';
      this.secondsState = 'normal';
    }
    console.log("slideRight")
  }

  slideLeft(event){
    event.preventDefault();
    //this.minuteState = 'collapsed';
    //this.secondsState = 'expanded';
    if(this.minuteState == "normal" || undefined == this.minuteState){
      this.minuteState = 'collapsed';
      this.secondsState = 'expanded';
    }
    else if(this.minuteState == "expanded"){
    console.log("expanded")
      this.minuteState = 'normal';
      this.secondsState = 'normal';
    }
    console.log("slideLeft")
  }


            /**
                 * Plotting the new points
                 * (rectangular bars) into the svg
                 */
                tick (barWidth, barHeight, svgWidth) {

                    var end = +new Date();
                    var start = end - 60*1000;

                    var x = d3.time.scale()
                    .domain([start, end])
                    .range([0, svgWidth]);

                    x.domain( [start, end] );

                    var points = this.chart.selectAll('rect')
                        .data(this.data);
                    
                    points.exit().remove();

                    points.enter().append('rect')    
                        .attr('x', function(d, i) { return x(d.time) ; })
                        .attr('y', 0 )
                        .attr('width', barWidth )
                        .attr('height', barHeight );
                    
                    points.transition()
                        .duration(100)
                        .attr('x', function(d, i) { return x(d.time) ; });
                }

  ngOnInit () {

    /**
                 * Holds the full list of
                 * points to be plotted
                 */
                this.data = [];

                var svgWidth = 350, svgHeight = 50, barWidth = 4, barHeight = 50;

                /**
                 * Initial set of data for
                 * first 60 seconds
                 * if available
                 */
                for (var i=0; i<60; i++) {

                    if (Math.random() > 0.8) {

                        var date = +new Date();
                        date -= (i*1000);

                        this.data.push({
                            time: date // from server 
                        });
                    }
                }

                /**
                 * Creating the chart
                 */
                this.chart = d3.select('.geo-scale-seconds')
                    .append('svg:svg')
                    .attr('class', 'chart')
                    .attr('width', svgWidth )
                    .attr('height', svgHeight);
                
                /**
                 * Building up the initial scale
                 * start: current time - 60 sec
                 * end: current time
                 */
                var end = +new Date();
                var start = end - 60*1000;

                var x = d3.time.scale()
                    .domain([start, end])
                    .range([0, svgWidth]);
                
                /**
                 * Plotting the initial points
                 * (rectangular bars) into the svg
                 */
                this.chart.selectAll('rect')
                    .data(this.data)
                    .enter().append('svg:rect')
                    .attr('x', function(d, i) { return x(d.time) ; })
                    .attr('y', 0)
                    .attr('width', barWidth)
                    .attr('height', barHeight);
                
                let that = this;

                /**
                 * Shifting the bar
                 * in every seconds
                 */
                setInterval(function () {

                    if (Math.random() > 0.8) {
                        
                        /**
                         * This need to be from
                         * the socket
                         */
                        that.data.push({
                            time: +new Date()
                        });
                    }

                    /**
                     * Remove the first entry
                     * if the total data length/size
                     * exceeds certain limit
                     */
                    if (that.data.length > 100) {
                        that.data.shift();
                    }

                    that.tick(barWidth, barHeight, svgWidth);

                }, 1000);

            }
  }


/*
collapsed
expanded
normal
*/