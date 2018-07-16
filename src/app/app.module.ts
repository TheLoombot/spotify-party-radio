import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

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
  AngularFireModule.initializeApp(environment.firebase, 'poop-a1c0e'),
  AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
