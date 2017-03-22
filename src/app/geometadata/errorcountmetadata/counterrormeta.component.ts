import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { ErrorMetaDataModel } from '../../geodata/errormetadata.model';

import * as _ from 'lodash';

@Component({
    selector: 'error-count',
    templateUrl: './counterrormeta.component.html'
})

/**
 * CountErrorMeta Component
 * 
 * handle error blocks data
 */
export class CountErrorMetaComponent {

    errorCodes: ErrorMetaDataModel[];
    codeNames: any[] = [];

    mismatches: any[] = [];

    /**
     * Constructor
     * initialize/inject services
     * 
     * @param private _geoDataService [service]
     * @return void
     */
    constructor (private _geoDataService : GeoDataService) {

        this.codeNames['1600112'] = 'Single CMTS comparison - CMTS Mismatch, Headend Mismatch';
        this.codeNames['1600117'] = 'Single CMTS comparison - CMTS Mismatch, Headend Match';
        this.codeNames['1600118'] = 'Multiple CMTS comparison - CMTS Mismatch, Headend Mismatch';
        this.codeNames['1600119'] = 'Multiple CMTS comparison - CMTS Mismatch, Headend Match';

        this.mismatches.push({type: 'total', name: 'Total', count: 0});
        this.mismatches.push({type: 'outsideHeadend', name: 'Outside Headend', count: 0});
        this.mismatches.push({type: 'withinHeadend', name: 'Within Headend', count: 0});
        this.mismatches.push({type: 'ftaSearched', name: 'FTA Searched due to Account and/or FiberNode issues', count: 0});
    }

    /**
     * Initialize
     * error component
     * 
     * @param null
     * @return void
     */
    ngOnInit() {

        this._geoDataService.errorMetaData.subscribe( (errorData) => {
            
            this.errorCodes = errorData;

            this.setMismatches();
        })
    }

    /**
     * Get error code
     * display name
     * 
     * @param string key
     * @return string
     */
    getName(key: string) : string {

        return this.codeNames[key];
    }

    /**
     * Update/set mismatches
     * 
     * @param null
     * @return void
     */
    setMismatches() : void {

        /**
         * Total: which is sum of 1600112+ 1600117 + 1600118 + 1600119
         * Outside Headend: sum of 1600112+1600118 (i.e. more severe condition)
         * Within Headend: sum of 1600117 + 1600119
         * FTA Searched due to Account and/or FiberNode issues: sum of 1600118 + 1600119
         */
        this.setMismatch('total', this._c('1600112') + this._c('1600117') + this._c('1600118') + this._c('1600119'));
        this.setMismatch('outsideHeadend', this._c('1600112') +this._c('1600118'));
        this.setMismatch('withinHeadend', this._c('1600117') +this._c('1600119'));
        this.setMismatch('ftaSearched', this._c('1600118') +this._c('1600119'));
    }

    /**
     * Set/Update
     * mismatch count
     */
    setMismatch(type: string, count: number) : void {

        _.set(_.find(this.mismatches, (mismatch) => {
            return _.get(mismatch, 'type', '') === type;
        }), 'count', count);
    }

    /**
     * Get the count
     * of the given error code
     */
    _c(code: string) : number {

        return _.get(_.find(this.errorCodes, {name: code}), 'count', 0)
    }
}
