import { Component, Input } from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { GeoDataModel } from '../geodata/geodata.model';

@Injectable()
export class GeoDataService{

    private geoDataDetails : any;
    private errorCodes: any;
    private divisions: any;
    private markets : any;
    private overallCount: any;

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
                this.errorCodes = data['countByErrorCode'];
                this.divisions = data['countByDivision'];
                this.markets = data['countByMarket'];
                this.overallCount = data['overallCount'];
            }));
        }
    }

}