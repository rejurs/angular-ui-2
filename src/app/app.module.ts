import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router';
import { rootRouterConfig } from './app.routes';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { GeoChartComponent } from './geochart/geochart.component';
import { D3Service } from 'd3-ng2-service';
import { GeoDataService } from './services/geoservice';
import { RealtimeScaleComponent } from './realtimescale/realtime-scale.component';
import { GeoMetaDataComponent } from './geometadata/geometadata.component';
import { KeysPipe } from './utils/pipemap.util';
import { OverallMetadataComponent } from './geometadata/overallmetadata/overallmetadata.component';
import { CountErrorMetaComponent } from './geometadata/errorcountmetadata/counterrormeta.component';
import { MarketMetaDataComponent } from './geometadata/marketmetadata/marketmetadata.component';
import { DivisionMetaDataComponent } from './geometadata/divisionmetadata/divisionmetadata.component';
import { WebSocketService } from './services/socketservice';

@NgModule({
  declarations: [
    AppComponent,
    GeoChartComponent,
    RealtimeScaleComponent,
    GeoMetaDataComponent,
    KeysPipe,
    OverallMetadataComponent,
    CountErrorMetaComponent,
    MarketMetaDataComponent,
    DivisionMetaDataComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: true })
  ],
  providers: [
    D3Service,
    GeoDataService,
    WebSocketService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {

}
