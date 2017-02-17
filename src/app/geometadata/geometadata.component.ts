import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../services/geoservice';
import {Observable} from 'rxjs/Rx';
import { GeoDataModel } from '../geodata/geodata.model';

@Component ({
    selector: 'geo-meta-data',
    templateUrl: './geometadata.component.html',
    styleUrls: ['./geometadata.component.css']
})

export class GeoMetaDataComponent {

    // private geoData: Array<GeoDataModel>;
    geoData;
    errorCodes: Array<Object>;
    overallCount: String;
    constructor(private geoService: GeoDataService) { // <-- pass the D3 Service into the constructor
        console.log("calling geo meta data service");
    }

    getInitialGeoData() {
       return this.geoService.getGeoData().map(
        (geoData) => {
            this.overallCount = geoData[0].overallCount;
        })
        .catch((error) => {
            throw error;
        });
        // .subscribe(res => this.geoData = res);
    }

    ngOnInit() {    
        console.log("calling....");   
        this.getInitialGeoData().subscribe(_ => {
            if(this.geoData) {
                //this.generateGeoView(this.geoData[0]["hubs"]);
            }
        });
    }
}