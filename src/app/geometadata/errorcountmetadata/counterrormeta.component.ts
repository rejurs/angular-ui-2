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

    codeNames: any[] = [];

    constructor (private _geoservice : GeoDataService) {

        this.codeNames['1600112'] = 'Single CMTS comparison - CMTS Mismatch, Headend Mismatch';
        this.codeNames['1600117'] = 'Single CMTS comparison - CMTS Mismatch, Headend Match';
        this.codeNames['1600118'] = 'Multiple CMTS comparison - CMTS Mismatch, Headend Mismatch';
        this.codeNames['1600119'] = 'Multiple CMTS comparison - CMTS Mismatch, Headend Match';
    }

    ngOnInit() {
        this._geoservice.errorMetaData.subscribe( (errorData) => {
            // console.log(errorData)
            this.errorCodes = errorData;
        })
    }

    getName(key: string) : string {
        return this.codeNames[key];
    }
}
