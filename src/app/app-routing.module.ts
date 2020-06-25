import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PerformLoginComponent } from './perform-login/perform-login.component';
import { CallbackComponent } from './callback/callback.component';
import { StationRouterComponent } from './station-router/station-router.component';

const routes: Routes = [
{ path: 'auth', component: CallbackComponent },
{ path: ':station', component: StationRouterComponent },
];

@NgModule({
	imports: [
	RouterModule.forRoot(routes)
	],
	exports: [
	RouterModule
	],
	providers: []
})
export class AppRoutingModule {
}
