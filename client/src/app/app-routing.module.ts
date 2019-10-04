import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesComponent } from '@components/view/files/files.component';
import { NotFoundComponent } from '@components/view/not-found/not-found.component';


const routes: Routes = [
  { path: 'files', children: [
    { path: '**', component: FilesComponent },
  ]},
  { path: '', redirectTo: '/files', pathMatch: 'full' },
  { path: 'notfound', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
