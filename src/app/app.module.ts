<<<<<<< HEAD
/* Core Modules */
=======
>>>>>>> 0846440b393f2b3f17e992a7273bbfb3b303df50
import { NgModule } from '@angular/core';
import { BrowserModule, Title  } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptor';
/* Custom Modules */
import { AppRoutingModule } from './app-routing.module';
/* External Modules */
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

/* Components */
import { AppComponent } from './app.component';
import { PerformLoginComponent } from './perform-login/perform-login.component';
import { SearchComponent } from './search/search.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { ErrorAlertComponent } from './error-alert/error-alert.component';
import { PlayerComponent } from './player/player.component';
import { RecosComponent } from './recos/recos.component';
import { ToptracksComponent } from './toptracks/toptracks.component';
import { AlertComponent } from './shared/components/alert/alert.component';

/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { StateService } from './shared/services/state.service';

/* Others */
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    PerformLoginComponent,
    SearchComponent,
    PlaylistComponent,
    ErrorAlertComponent,
    PlayerComponent,
    RecosComponent,
    ToptracksComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    HttpClientModule
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
