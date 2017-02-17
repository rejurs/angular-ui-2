export class GeoDataModel {
    geoData: any;
    hubs : any;
    overallCount: string;
    divisionCount : any;
    errorCodeCount : any;
    marketCount : any;
    constructor(geoData: any) {
        this.hubs = geoData["Hub"];
        this.overallCount = geoData["overallCount"];
        this.divisionCount = geoData["countByDivision"];
        this.errorCodeCount = geoData["countByErrorCode"];
        this.marketCount = geoData["countByMarket"];
    }
  }
