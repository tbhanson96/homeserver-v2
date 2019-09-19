import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { MdcTopAppBarModule } from '@angular-mdc/web';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MdcTopAppBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
