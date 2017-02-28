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
        this.divisions = divisionData;
    }
}