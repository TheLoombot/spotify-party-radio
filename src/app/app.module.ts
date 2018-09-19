import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

/* Services */
import { SpotifyService } from './shared/services/spotify.service';

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
    ToptracksComponent
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },
    SpotifyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
