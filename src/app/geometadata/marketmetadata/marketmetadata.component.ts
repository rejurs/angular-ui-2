import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { MarketMetaDataModel } from '../../geodata/marketmetadata.model';

import * as _ from 'lodash';

@Component({
    selector: 'market',
    templateUrl: './marketmetadata.component.html'
})

export class MarketMetaDataComponent {

    markets: MarketMetaDataModel[];

    constructor(private _geoservice: GeoDataService) { }

    ngOnInit() {

        this._geoservice.marketData.subscribe((markets) => {
            this.sortMarkets(markets);
        })
    }

    sortMarkets(marketData) {

        if (marketData && marketData.length) {
            if (marketData.length === 1) {
                marketData.forEach(function (d) {
                    d.name = _.capitalize(d.name);
                });
            } else {
                marketData.sort(function (a, b) {
                    a.name = _.capitalize(a.name);
                    b.name = _.capitalize(b.name);
                    return b.count - a.count;
                });
            }
            this.markets = marketData;
        }
    }
}