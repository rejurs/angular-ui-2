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
        if(divisionData && divisionData.length){
            if(divisionData.length === 1) {
                divisionData.forEach(function(d) {
                    d.name = _.capitalize(d.name);
                });
            } else {
                divisionData.sort(function(a, b) {
                    a.name = _.capitalize(a.name);
                    b.name = _.capitalize(b.name);
                    return _.get(b, 'count', 0) - _.get(a, 'count', 0);
                });
            }
        }

        let divisionItems = [];
        
        switch(this.area) {
            case 'geo-central-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: _.get(divisionData,'[0].count', 0)
                });
                break;
            case 'geo-ne-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: _.get(divisionData,'[1].count', 0)
                }); 
                break;
            case 'geo-west-division' :
                divisionItems.push({
                    name: "Total Counts",
                    count: _.get(divisionData,'[2].count', 0)
                }); 
                break;
            case 'kpi' :
                divisionItems = divisionData; 
                break;
        }

        this.divisions = divisionItems;
    }
}
