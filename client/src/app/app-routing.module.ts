import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesComponent } from '@components/view/files/files.component';
import { NotFoundComponent } from '@components/view/not-found/not-found.component';
import { AuthComponent } from '@components/view/auth/auth.component';
import { HomeComponent } from '@components/layout/main/home.component';
import { AuthService } from '@services/auth.service';
import { EbooksComponent } from '@components/view/ebooks/ebooks.component';
import { TorrentsComponent } from '@components/view/torrents/torrents.component';
import { HealthComponent } from '@components/view/health/health.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthService], children: [
    { path: '', redirectTo: 'files', pathMatch: 'full'},
    { path: 'files', children: [
      { path: '**', component: FilesComponent },
    ]},
    { path: 'ebooks', component: EbooksComponent },
    { path: 'torrents', component: TorrentsComponent },
    { path: 'health', component: HealthComponent },
  ]},
  { path: 'login', component: AuthComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
