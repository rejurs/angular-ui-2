import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { DivisionMetaDataModel } from '../../geodata/divisionmetadata.model';

@Component({
    selector: 'division',
    templateUrl: './divisionmetadata.component.html'
})
export class DivisionMetaDataComponent {

    divisions: DivisionMetaDataModel[]

    constructor (private _geoservice : GeoDataService) {}

    ngOnInit() {
        this._geoservice.divisionMetaData.subscribe( ( divisions ) => {
            this.divisions = divisions;
        });
    }
}