export class GeoDataModel {
    // overallCount: string;
    // countByErrorCode: Array<any>;
    // countByDivision: Array<any>;
    // countByMarket: Array<any>;
    // hub: Array<any>;
    // constructor(overallCount: string, 
    //             countByErrorCode: Array<any>,
    //             countByDivision: Array<any>,
    //             countByMarket: Array<any>,
    //             hub: Array<any>) {
    //   this.overallCount = overallCount;
    //   this.countByErrorCode = countByErrorCode;
    //   this.countByDivision = countByDivision;
    //   this.countByMarket = countByMarket;
    //   this.hub = hub;
    // }

    geoData : any;
    constructor(geoData: any) {
        this.geoData = geoData;
    }
  }