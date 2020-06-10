/* Core Modules */
import { NgModule } from '@angular/core';
import { BrowserModule, Title  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptor';
/* Custom Modules */
import { AppRoutingModule } from './app-routing.module';
/* External Modules */
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

/* Components */
import { AppComponent } from './app.component';
import { PerformLoginComponent } from './perform-login/perform-login.component';
import { SearchComponent } from './search/search.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlayerComponent } from './player/player.component';
import { RecosComponent } from './recos/recos.component';
import { ToptracksComponent } from './toptracks/toptracks.component';
/* Shared Components */
import { AlertComponent } from './shared/components/alert/alert.component';

/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { StateService } from './shared/services/state.service';

/* Others */
import { environment } from '../environments/environment';
import { StationpickerComponent } from './stationpicker/stationpicker.component';
import { PlayerpickerComponent } from './playerpicker/playerpicker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserPlaylistsComponent } from './user-playlists/user-playlists.component';

@NgModule({
  declarations: [
    AppComponent,
    PerformLoginComponent,
    SearchComponent,
    PlaylistComponent,
    PlayerComponent,
    RecosComponent,
    ToptracksComponent,
    AlertComponent,
    StationpickerComponent,
    PlayerpickerComponent,
    UserPlaylistsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [
    Title,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },
    SpotifyService,
    StateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
