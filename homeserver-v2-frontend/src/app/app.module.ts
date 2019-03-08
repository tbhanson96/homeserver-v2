import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FilesComponent } from './files/files.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FileEntryComponent } from './file-entry/file-entry.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FilesComponent,
    NavbarComponent,
    FileEntryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
