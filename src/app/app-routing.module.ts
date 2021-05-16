import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { StationComponent } from './station/station.component';

const routes: Routes = [
{ path: 'auth', component: CallbackComponent },
{ path: ':station', component: StationComponent },
{ path: '', component: CallbackComponent },
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
