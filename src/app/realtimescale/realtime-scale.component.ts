import {Component, NgModule, animate, state, style, transition, trigger} from '@angular/core';

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
}

/*
collapsed
expanded
normal
*/