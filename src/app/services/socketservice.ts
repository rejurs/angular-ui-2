import {Component} from '@angular/core';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare var require: any

var SockJS = require('sockjs-client');
var Stomp = require('stompjs');

export class WebSocketService {
stompClient: any;
uniqueid: any;
activityId: any;
text: any;
messages: Array<String> = new Array<String>();

  
  constructor() {
  }

   subscribe() {
        let that = this;
		//sock js do http request for handshaking before creating websocket
        let socket = new SockJS('https://fcs_websocket-fcs-websocket-sink-rabbit.g1.app.cloud.comcast.net/gs-geo-websocket');
		//Using stomp over websocket
        this.stompClient = Stomp.over(socket);
		//connecting
        this.stompClient.connect({}, function (frame) {
             console.log('Connected: ' + frame);
             that.stompClient.subscribe('/topic/geo', function (realtime) {
				//subscribe realtime event
				if(JSON.parse(realtime.body)){
					//realtime data
					let obj = JSON.parse(realtime.body);
                }
            });

            that.stompClient.subscribe('/topic/geo/'+that.uniqueid, function (historical) {
				 //subscribe historical data event	
                 if(JSON.parse(historical.body)){
					//historical data
                    let obj = JSON.parse(historical.body);
                }
            });
            that.reload();
        });
      }
    reload() {
		// send request in websocket for historical data
		// required only once while reloading the page or for the first time
        console.log(this.uniqueid);
        this.stompClient.send("/app/historical", {}, JSON.stringify({'name': this.uniqueid}));
    }

}

