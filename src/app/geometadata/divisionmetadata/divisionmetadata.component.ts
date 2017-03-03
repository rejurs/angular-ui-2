import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { DivisionMetaDataModel } from '../../geodata/divisionmetadata.model';

import * as _ from 'lodash';
@Component({
    selector: 'division',
    templateUrl: './divisionmetadata.component.html'
})
export class DivisionMetaDataComponent {

    @Input() area

    divisions: DivisionMetaDataModel[]

    constructor (private _geoservice : GeoDataService) {}

    ngOnInit() {
        this._geoservice.divisionMetaData.subscribe( ( divisions ) => {
            this.sortDivisions(divisions);
        });
    }

    sortDivisions(divisionData) {
        divisionData.sort(function(a, b) {
            a.name = _.capitalize(a.name);
            b.name = _.capitalize(b.name);
            return b.count - a.count;
        });

        let divisionItems = [];
        
        switch(this.area) {
            case 'geo-central-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: divisionData[0].count
                });
                break;
            case 'geo-ne-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: divisionData[1].count
                }); 
                break;
            case 'geo-west-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: divisionData[2].count
                }); 
                break;
            case 'kpi' :
                divisionItems = divisionData; 
                break;
        }

        this.divisions = divisionItems;
    }
}