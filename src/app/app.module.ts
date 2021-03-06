import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router';
import { rootRouterConfig } from './app.routes';
import { AppComponent } from './app.component';
import { GithubService } from './github/shared/github.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { RepoBrowserComponent } from './github/repo-browser/repo-browser.component';
import { RepoListComponent } from './github/repo-list/repo-list.component';
import { RepoDetailComponent } from './github/repo-detail/repo-detail.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ContactComponent } from './contact/contact.component';
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
    AboutComponent,
    RepoBrowserComponent,
    RepoListComponent,
    RepoDetailComponent,
    HomeComponent,
    ContactComponent,
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
    GithubService,
    D3Service,
    GeoDataService,
    WebSocketService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {

}
