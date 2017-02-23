import { Component, Input, OnInit, Pipe, PipeTransform, OnChanges } from '@angular/core';
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
    constructor(private geoService: GeoDataService) { // <-- pass the D3 Service into the constructor
        console.log("calling geo meta data service");
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

}