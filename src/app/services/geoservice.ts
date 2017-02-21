import { Component, Input, OnInit } from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Subject }    from 'rxjs/Subject';
import { HubNames } from '../geodata/hubnames.model';

@Injectable()
export class GeoDataService{

    private geoDataDetails : any;
    private usCoordinates: any;
    private hubDetails: HubNames[];
    socketData: Subject<HubNames[]> = new Subject<HubNames[]>();

    constructor(private http: Http) {
        console.log('Geo Service created...');
    }

    getGeoData () {
        if(this.geoDataDetails) {
            console.log("here the call....");
            return Observable.of(this.geoDataDetails);
        } else {
            return this.http.get('./app/geodata/geodatamock.1.json')
                .map((res:Response) => {
                return res.json()
            })
            .do((data => {
                this.geoDataDetails = data;
                Observable.of(this.hubDetails = data['Hub']);
            }));
        }
    }
    
    ngOnInit() {}

    generateUsCoordinates () {
        return this.http.get('./app/uscoordinates.json')
            .map((res: Response) => {
            return res.json();
        })
        .do((data => {
            this.usCoordinates = data;
        }));
    }

    getHubData () {
        return Observable.of(this.hubDetails).publish().refCount();
    }

    getGeoViewData () {
        return Observable.of(this.geoDataDetails).publish().refCount();
    }

    getUsCoordinates () {
        return Observable.of(this.usCoordinates).publish().refCount();
    }

    generateSocketData() {
        /** Logic to add the data */
        let hubs = ['KEY WEST (FL)', 'MARATHON (FL)', 'COLORADO 1 (CO)', 'COLORADO (CO)', 'CONNECTICUT (CT)', 'KEY WEST 1 (FL)', 'KEY LARGO 1 (FL)', 'MARATHON 1 (FL)', 'COLORADO 2 (CO)'];

        return Observable.of(setInterval( () => {
            var data = "";
            data = hubs[Math.floor(Math.random()*hubs.length)];
            this.hubDetails.forEach(element => {
            if(element.HubName == data) {
                element.Total = String(Number(element.Total) + 1);
                element.isNew = true;
            }
            });
            this.socketData.next(this.hubDetails);
        }, 5000))
    }

}