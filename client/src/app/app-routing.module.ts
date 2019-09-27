import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesComponent } from '@components/view/files/files.component';


const routes: Routes = [
  { path: 'files', children: [
    { path: '**', component: FilesComponent },
  ]},
  { path: '', redirectTo: '/files', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
