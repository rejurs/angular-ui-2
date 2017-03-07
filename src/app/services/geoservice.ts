import { Component, Input, OnInit } from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Subject }    from 'rxjs/Subject';
import { HubNames } from '../geodata/hubnames.model';
import { OverallMetaModel } from '../geodata/overallmeta.model';
import { MarketMetaDataModel } from '../geodata/marketmetadata.model';
import { ErrorMetaDataModel } from '../geodata/errormetadata.model';
import { DivisionMetaDataModel } from '../geodata/divisionmetadata.model';
import { WebSocketService } from '../services/socketservice';
import * as _ from 'lodash';

@Injectable()
export class GeoDataService {

    private geoDataDetails: any;
    private usCoordinates: any;
    private overallCountData: number;
    private hubDetails: HubNames[];
    private outsideHeadend: number;
    private withinHeadend: number;
    private errorMeta: ErrorMetaDataModel[];
    private marketMeta: MarketMetaDataModel[];
    private divisionMeta: DivisionMetaDataModel[];
    socketData: Subject<HubNames[]> = new Subject<HubNames[]>();
    overallCount: Subject<OverallMetaModel> = new Subject<OverallMetaModel>();
    marketData: Subject<MarketMetaDataModel[]> = new Subject<MarketMetaDataModel[]>();
    errorMetaData: Subject<ErrorMetaDataModel[]> = new Subject<ErrorMetaDataModel[]>();
    divisionMetaData: Subject<DivisionMetaDataModel[]> = new Subject<DivisionMetaDataModel[]>();
    realTimeSocketData: Subject<any[]> = new Subject<any[]>();

    constructor(private http: Http, private _socketservice: WebSocketService) {
        console.log('Geo Service created...');
    }

    getHistoricalData() {
        let that = this;
        return Observable.create(function (observer) {
            that._socketservice.historicalData.subscribe((data) => {
                that.geoDataDetails = data;
                that.overallCountData = data['overallCount'];
                that.errorMeta = data['countByErrorCode'];
                that.marketMeta = data['countByMarket'];
                that.divisionMeta = data['countByDivision'];
                Observable.of(that.hubDetails = data['hub']);
                observer.next(1);
            });
        });
    }

    /** To increase the KPI error code count */
    errorCodeIncrement(code: string) {
        this.errorMeta.forEach(errorElem => {
            if (errorElem.name === code) {
                errorElem.count += 1;
            }
        });
    }

    getGeoData() {
        if (this.geoDataDetails) {
            console.log("here the call....");
            return Observable.of(this.geoDataDetails);
        } else {
            return this.http.get('./app/assets/data.json')
                .map((res: Response) => {
                    return res.json()
                })
                .do((data => {
                    this.geoDataDetails = data;
                    this.overallCountData = data['overallCount'];
                    this.errorMeta = data['countByErrorCode'];
                    this.marketMeta = data['countByMarket'];
                    this.divisionMeta = data['countByDivision'];
                    Observable.of(this.hubDetails = data['hub']);
                }));
        }
    }

    getRealTimeData() {
        let that = this;
        return Observable.create(function (observer) {
            that._socketservice.realTimeData.subscribe((data) => {

                data.forEach(item => {
                    that.hubDetails.forEach(element => {
                        if (element.name == item['HubName']) {
                            element.total = element.total + 1;
                            element.isNew = true;
                            element.uid = that.slugify(element.name);
                            //Check to count outsideheadend, withinheadend, fibernodeissue and KPI error counts
                            if (item.hasOwnProperty('1600112')) {
                                element.outsideHeadEnd += 1;
                                that.errorCodeIncrement('1600112');
                            } else if (item.hasOwnProperty('1600117')) {
                                element.withinHeadEnd += 1;   // Sum of 1600117 + 1600119
                                that.errorCodeIncrement('1600117');
                            } else if (item.hasOwnProperty('1600118')) {
                                element.fiberNodeIssue += 1;  // Sum of 1600118 + 1600119
                                element.outsideHeadEnd += 1;  // Sum of 1600118 + 1600112
                                that.errorCodeIncrement('1600118');
                            } else if (item.hasOwnProperty('1600119')) {
                                element.fiberNodeIssue += 1;  // Sum of 1600118 + 1600119
                                that.errorCodeIncrement('1600119');
                            }

                            //check to increment the market count
                            that.incrementMarketCount(element.market);

                            //check to increment the division count
                            that.incrementDivisionCount(element.division);
                        }
                    });
                });

                that.socketData.next(that.hubDetails);
                that.overallCountData += 1;
                that.overallCount.next(new OverallMetaModel(that.overallCountData));
                that.errorMetaData.next(that.errorMeta);
                that.marketData.next(that.marketMeta);
                that.divisionMetaData.next(that.divisionMeta);
                that.realTimeSocketData.next(data);
                observer.next(data);
            });
        });
    }

    generateUsCoordinates() {
        return this.http.get('./app/assets/uscoordinates.json')
            .map((res: Response) => {
                return res.json();
            })
            .do((data => {
                this.usCoordinates = data;
                this.socketData.next(this.hubDetails);
                this.overallCount.next(new OverallMetaModel(this.overallCountData));
                this.errorMetaData.next(this.errorMeta);
                this.marketData.next(this.marketMeta);
                this.divisionMetaData.next(this.divisionMeta);
            }));
    }

    getHubData() {
        return Observable.of(this.hubDetails).publish().refCount();
    }

    getGeoViewData() {
        return Observable.of(this.geoDataDetails).publish().refCount();
    }

    getUsCoordinates() {
        return Observable.of(this.usCoordinates).publish().refCount();
    }

    generateSocketData() {
        /** Logic to add the data */
        let hubs = [{
            HubName: 'OREM (UT)',
            1600112: 1
        }, {
                HubName: 'SOUTH (IN)',
                1600117: 1
            }, {
                Hubname: 'POTOMAC (MD)',
                1600118: 1
            }, {
                HubName: 'JEFFERSON (PA)',
                1600119: 1
            }, {
                HubName: 'RURAL VALLEY (PA)',
                1600112: 1
            }, {
                HubName: 'Y2CARTERSVILLE (GA)',
                1600113: 1
            }, {
                Hubname: 'F3SFULTON (GA)',
                1600119: 1
            }, {
                HubName: 'PLAINFIELD (NJ)',
                1600118: 1
            }, {
                HubName: 'WARREN 1-2 (MI)',
                1600117: 1
            }, {
                HubName: 'WINCHESTER CITY (TN)',
                1600112: 1
            }, {
                HubName: 'HIALEAH WEST (FL)',
                1600118: 1
            }, {
                HubName: 'ST JOSEPH (MI)',
                1600117: 1
            }, {
                HubName: 'ABERDEEN (MD)',
                1600112: 1
            }, {
                HubName: 'MANASSAS (VA)',
                1600118: 1
            }, {
                HubName: 'WATERBURY (CT)',
                1600119: 1
            }, {
                HubName: 'WEST YORK (PA)',
                1600118: 1
            }, {
                HubName: 'FOREST HILL (VA)',
                1600119: 1
            }, {
                HubName: 'SNYDER (AZ)',
                1600119: 1
            }, {
                HubName: 'HAMMOND (IN)',
                1600112: 1
            }, {
                HubName: 'KEY LARGO (FL)',
                1600117: 1
            }, {
                HubName: 'CORVALLIS (OR)',
                1600112: 1
            }, {
                HubName: 'WEST CHICAGO-POD-6 (IL)',
                1600118: 1
            }, {
                HubName: 'COLUMBUS (PA)',
                1600117: 1
            }];

        return Observable.of(setInterval(() => {
            let that = this;
            var data: any;

            if (Math.random() > 0.85) {

                data = hubs[Math.floor(Math.random() * hubs.length)];
                data.time = +new Date();
                
                let realData: any[] = [data];
                
                realData.forEach(item => {

                    this.hubDetails.forEach(element => {
                        if (element.name == item['HubName']) {
                            element.total = element.total + 1;
                            element.isNew = true;
                            element.uid = this.slugify(element.name);
                            //Check to count outsideheadend, withinheadend, fibernodeissue and KPI error counts
                            if (item.hasOwnProperty('1600112')) {
                                element.outsideHeadEnd += 1;
                                that.errorCodeIncrement('1600112');
                            } else if (item.hasOwnProperty('1600117')) {
                                element.withinHeadEnd += 1;   // Sum of 1600117 + 1600119
                                that.errorCodeIncrement('1600117');
                            } else if (item.hasOwnProperty('1600118')) {
                                element.fiberNodeIssue += 1;  // Sum of 1600118 + 1600119
                                element.outsideHeadEnd += 1;  // Sum of 1600118 + 1600112
                                that.errorCodeIncrement('1600118');
                            } else if (item.hasOwnProperty('1600119')) {
                                element.fiberNodeIssue += 1;  // Sum of 1600118 + 1600119
                                that.errorCodeIncrement('1600119');
                            }

                            //check to increment the market count
                            that.incrementMarketCount(element.market);

                            //check to increment the division count
                            that.incrementDivisionCount(element.division);
                        }
                    });
                });

                this.socketData.next(this.hubDetails);
                this.overallCountData += 1;
                this.overallCount.next(new OverallMetaModel(this.overallCountData));
                this.errorMetaData.next(this.errorMeta);
                this.marketData.next(this.marketMeta);
                this.divisionMetaData.next(this.divisionMeta);
                this.realTimeSocketData.next(realData);
            }
        }, 1000))
    }

    /** To increase the KPI Market count */
    incrementMarketCount(marketName: string) {
        this.marketMeta.forEach(marketItem => {
            if (marketItem.name === _.capitalize(marketName)) {
                marketItem.count += 1;
            }
        });
    }

    /** To increase the KPI Division count */
    incrementDivisionCount(divsionName: string) {
        this.divisionMeta.forEach(divisionItem => {
            if (divisionItem.name === _.capitalize(divsionName)) {
                divisionItem.count += 1;
            }
        });
    }

    slugify(arg: string) {
        return arg.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    countOutsideHeadend(element) {

    }

}
