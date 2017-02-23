import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { ErrorMetaDataModel } from '../../geodata/errormetadata.model';

@Component({
    selector: 'error-count',
    templateUrl: './counterrormeta.component.html'
})
export class CountErrorMetaComponent {

    errorCodes: ErrorMetaDataModel[]

    constructor (private _geoservice : GeoDataService) {}

    ngOnInit() {
        this._geoservice.errorMetaData.subscribe( (errorData) => {
            this.errorCodes = errorData;
        })
    }
}