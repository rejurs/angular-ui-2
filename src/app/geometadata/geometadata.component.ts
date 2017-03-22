import { Component } from '@angular/core';

@Component ({
    selector: 'geo-meta-data',
    templateUrl: './geometadata.component.html',
    styleUrls: ['./geometadata.component.css'],
})

export class GeoMetaDataComponent {

    public kpi: string = 'kpi';

    constructor() {}
}