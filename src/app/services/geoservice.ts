import { Component, Input } from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { GeoDataModel } from '../geodata/geodata.model';

@Injectable()
export class GeoDataService{

    data;

    constructor(private http: Http) {
        console.log('Geo Service created...');
    }

    getGeoData () {
        console.log("called the getGeoData service");
        return this.http.get('./app/geodata/geodatamock.json').map((res:Response) => {
            return res.json()
        })
        .map((geoData: Array<any>) => {
            let results:Array<GeoDataModel> = [];
            console.log(geoData);
            if(geoData) {
                // geoData.forEach((geoDataItem) => {
                    results.push(
                        new GeoDataModel(geoData)
                        );
                // });
            }
            return results;
        });
    }

}