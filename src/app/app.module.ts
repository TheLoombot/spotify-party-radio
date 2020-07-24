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
import { RecosComponent } from './recos/recos.component';
/* Shared Components */
import { AlertComponent } from './shared/components/alert/alert.component';

/* Services */
import { SpotifyService } from './shared/services/spotify.service';
import { StateService } from './shared/services/state.service';

/* Others */
import { environment } from '../environments/environment';
import { PlayerpickerComponent } from './playerpicker/playerpicker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserPlaylistsComponent } from './user-playlists/user-playlists.component';
import { CallbackComponent } from './callback/callback.component';
import { LoggedInUserComponent } from './logged-in-user/logged-in-user.component';
import { StationRouterComponent } from './station-router/station-router.component';
import { ChatComponent } from './chat/chat.component';
import { AddTracksComponent } from './add-tracks/add-tracks.component';

@NgModule({
  declarations: [
    AppComponent,
    PerformLoginComponent,
    SearchComponent,
    PlaylistComponent,
    RecosComponent,
    AlertComponent,
    PlayerpickerComponent,
    UserPlaylistsComponent,
    CallbackComponent,
    LoggedInUserComponent,
    StationRouterComponent,
    ChatComponent,
    AddTracksComponent
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
