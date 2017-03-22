import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { DivisionMetaDataModel } from '../../geodata/divisionmetadata.model';

import * as _ from 'lodash';

@Component({
    selector: 'division',
    templateUrl: './divisionmetadata.component.html'
})

/**
 * DivisionMetaData Component
 * 
 * handle division blocks data
 */
export class DivisionMetaDataComponent {

    @Input() area;

    divisions: DivisionMetaDataModel[];

    /**
     * Constructor
     * initialize/inject services
     * 
     * @param private _geoDataService [service]
     * @return void
     */
    constructor (private _geoDataService : GeoDataService) {}

    /**
     * Initialize
     * error component
     * 
     * @param null
     * @return void
     */
    ngOnInit() {

        this._geoDataService.divisionMetaData.subscribe( ( divisions ) => {
            this.processDivisions(divisions);
        });
    }

    /**
     * Process divisions
     * 
     * @param any[] divisionData
     * @return void
     */
    processDivisions(divisionData: any[]) : void {

        if (divisionData && divisionData.length) {

            if (divisionData.length === 1) {

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

        let count: number;
        let divisionItems: any[] = [];
        
        switch(this.area) {

            /**
             * Central division
             */
            case 'geo-central-division':

                count = _.get(_.find(divisionData, function (item) {
                    return _.toUpper(_.get(item, 'name', '')) === 'CENTRAL';
                }), 'count', 0);

                divisionItems.push({
                    name: "Total Counts",
                    count: count
                });
                break;

            /**
             * North east division
             */
            case 'geo-ne-division':

                count = _.get(_.find(divisionData, function (item) {
                    return _.toUpper(_.get(item, 'name', '')) === 'NORTHEAST';
                }), 'count', 0);

                divisionItems.push({
                    name: "Total Counts",
                    count: count
                }); 
                break;

            /**
             * West division
             */
            case 'geo-west-division':

                count = _.get(_.find(divisionData, function (item) {
                    return _.toUpper(_.get(item, 'name', '')) === 'WEST';
                }), 'count', 0);

                divisionItems.push({
                    name: "Total Counts",
                    count: count
                });
                break;

            case 'kpi':
                divisionItems = divisionData; 
                break;
        }

        this.divisions = divisionItems;
    }
}