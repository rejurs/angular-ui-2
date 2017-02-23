import { Component, Input, OnInit } from '@angular/core';
import { GeoDataService } from '../../services/geoservice';
import { Observable } from 'rxjs/Rx';
import { MarketMetaDataModel } from '../../geodata/marketmetadata.model';

@Component({
    selector: 'market',
    templateUrl: './marketmetadata.component.html'
})
export class MarketMetaDataComponent {

    markets : MarketMetaDataModel[];
    constructor (private _geoservice: GeoDataService) {}

    ngOnInit() {
        this._geoservice.marketData.subscribe( (markets) => {
            this.markets = this.sortMarkets(markets);
        })
    }

    sortMarkets(marketData) {
        let data = [];
        marketData.sort(function(a, b) {
            return b.count - a.count;
        })
        return marketData;
    }

}