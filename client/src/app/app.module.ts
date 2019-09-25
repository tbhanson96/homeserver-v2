import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MdcTopAppBarModule, MdcIconModule, MdcDrawerModule, MdcListModule } from '@angular-mdc/web';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from '@components/layout/topbar/top-bar.component';
import { SideBarComponent } from '@components/layout/side-bar/side-bar.component';
import { ReduxModule } from './redux.module';
import { StoreModule } from '@ngrx/store';
import { rootReducer } from '@reducers/root.reducer';
import { FilesComponent } from '@components/view/files/files.component';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    SideBarComponent,
    FilesComponent
  ],
  imports: [
    ReduxModule,
    StoreModule.forRoot(rootReducer),
    FlexLayoutModule,
    BrowserModule,
    AppRoutingModule,
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
