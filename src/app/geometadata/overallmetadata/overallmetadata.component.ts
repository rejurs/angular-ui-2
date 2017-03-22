import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { OverallMetaModel } from '../../geodata/overallmeta.model';

@Component({
    selector: 'overall-count',
    templateUrl: './overallmetadata.component.html',
    styleUrls: ['./overallmetadata.component.css']
})

export class OverallMetadataComponent {

    overallCount: number = 0;

    constructor(private _geoservice: GeoDataService) {}

    ngOnInit() {

        this._geoservice.overallCount.subscribe( (overall) => {
            this.overallCount = overall.overallCount;
        });
    }

}