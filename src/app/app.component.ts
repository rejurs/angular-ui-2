import {Component} from '@angular/core';

@Component({
  selector: 'app',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  mainGeoChart: any = {
    height: 600,
    width:  950,
    divId: "geo-chart"
  };
  divisionChart: any = {
    height: 300,
    width:  400,
    centralDivId: "geo-central-division",
    neDivId: "geo-ne-division",
    westDivId: "geo-west-division"
  };
}
