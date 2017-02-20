import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

export class GeoMetaDataService {
    
    private _url:string = '../geodata/geodatamock1.json'

    constructor(private _http: Http) {}

    private _geoData

    // ngOnInit() {
    //     this.getGeoData();
    // }

    getGeoData() {
        return this._http.get(this._url)
            .map(response => {
                this._geoData = response.json();
            });
    }
}
