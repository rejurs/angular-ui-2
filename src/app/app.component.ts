import { Component, OnInit } from '@angular/core';
import { GeoDataService } from './services/geoservice';
import { WebSocketService } from './services/socketservice.ts';

@Component({
  selector: 'app',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent {

  mainGeoChart:any

  divisionChart: any

  hubDetails: any

  constructor(private _geoservice: GeoDataService, private _websocketservice: WebSocketService) {

    this.mainGeoChart = {
      height: 600,
      width:  950,
      divId: "geo-chart"
    };
    this.divisionChart = {
      height: 300,
      width:  400,
      centralDivId: "geo-central-division",
      neDivId: "geo-ne-division",
      westDivId: "geo-west-division"
    };
  }

  ngOnInit() {
    /** Uncomment this block of code for real data */
    this._websocketservice.subscribe();

    /** Comment this block of code for real data */
    this._geoservice.getGeoData().subscribe( data => {
      console.log("Geo Data Fetched ! ");
    });

    /** Uncomment this block of code for real data */
    /*
    this._geoservice.getHistoricalData().subscribe( data => {
      console.log("Geo Data Fetched ! ");
    });
    */

    this._geoservice.generateUsCoordinates().subscribe( data => {
      console.log("Us Coordinates generated and ready to fetch !");
    });

    /** Comment this block of code for real data */
    this._geoservice.generateSocketData().subscribe( data => {  
      console.log("Socket connection established...");
    });
    
  }
  
}
