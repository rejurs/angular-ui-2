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
            return this.http.get('./app/geodata/geodatamock.json')
                .map((res:Response) => {
                return res.json()
            })
            .do((data => {
                this.geoDataDetails = data;
                Observable.of(this.hubDetails = data['hub']);
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
            this.socketData.next(this.hubDetails);
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
        let hubs = ['OREM (UT)', 'SOUTH (IN)', 'POTOMAC (MD)', 'JEFFERSON (PA)', 'RURAL VALLEY (PA)', 'Y2CARTERSVILLE (GA)', 'F3SFULTON (GA)', 'PLAINFIELD (NJ)', 'WARREN 1-2 (MI)','WINCHESTER CITY (TN)', 'HIALEAH WEST (FL)','ST JOSEPH (MI)', 'ABERDEEN (MD)', 'MANASSAS (VA)','WATERBURY (CT)','WEST YORK (PA)','FOREST HILL (VA)','SNYDER (AZ)','HAMMOND (IN)','KEY LARGO (FL)','CORVALLIS (OR)','WEST CHICAGO-POD-6 (IL)','COLUMBUS (PA)'];

        return Observable.of(setInterval( () => {
            var data = "";
            if(Math.random() > 0.85) {
                data = hubs[Math.floor(Math.random()*hubs.length)];
                this.hubDetails.forEach(element => {
                if(element.name == data) {
                    element.total = String(Number(element.total) + 1);
                    element.isNew = true;
                    element.uid = this.slugify(element.name);
                }
                });
                this.socketData.next(this.hubDetails);
            }
        }, 1000))
    }

    slugify (arg: string) {
        return arg.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

}