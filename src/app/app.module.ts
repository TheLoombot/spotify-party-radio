import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptor';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { PerformLoginComponent } from './perform-login/perform-login.component';

@NgModule({
  declarations: [
  AppComponent,
  LoginComponent,
  PerformLoginComponent
  ],
  imports: [
  BrowserModule,
  AppRoutingModule,
  FormsModule,
  AngularFireModule.initializeApp(environment.firebase),
  AngularFireDatabaseModule,
  HttpModule,
  HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
