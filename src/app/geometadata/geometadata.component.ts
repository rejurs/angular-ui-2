import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { GeoDataService } from '../services/geoservice';
import {Observable} from 'rxjs/Rx';
import { GeoDataModel } from '../geodata/geodata.model';
import { KeysPipe } from '../utils/pipemap.util';

@Component ({
    selector: 'geo-meta-data',
    templateUrl: './geometadata.component.html',
    styleUrls: ['./geometadata.component.css'],
})

export class GeoMetaDataComponent {
    geoData;
    errorCodes = [];
    divisions = [];
    markets = [];
    geometaData = [{
        overallCount:{
            title: "LAST 24 HOURS ACTIVITIES"
        },
        errorCodes: {
            title: "COUNTS BY MISMATCH CONDITIONS"
        },
        divisions: {
            title: "COUNTS BY DIVISION"
        },
        markets: {
            title: "TOP 5 MARKETS"
        }
    }];
    overallCount: String;
    constructor(private geoService: GeoDataService) { // <-- pass the D3 Service into the constructor
        console.log("calling geo meta data service");
    }

    getHubDetails() {
        this.geoService.getGeoViewData().subscribe( (geoData) => {
            console.log(geoData);
            this.overallCount = geoData['overallCount'];
            this.errorCodes = geoData['countByErrorCode'];
            this.divisions = geoData['countByDivision'];
            this.markets = this.sortMarkets(geoData['countByMarket']);
        });
    }

    ngOnInit() {

        setTimeout ( () => {
            this.getHubDetails();
        }, 2000);
    }

    formatObject(errorTempData) {
        let keys = [];
        for (let key in errorTempData) {
            let val = errorTempData[key];
            for(let temp in val) {
                keys.push({
                keyName: temp,
                keyValue: val[temp]
                });
            }
        }
        return keys;
    } // End formatObject

    sortMarkets(marketData) {
        let data = [];
        marketData.sort(function(a, b) {
            return b.marketCount - a.marketCount;
        })
        return marketData;
    }

    ngOnInitChanges() {
        console.log(this.errorCodes);
    }
}