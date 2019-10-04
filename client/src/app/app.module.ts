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
import { HttpClientModule } from '@angular/common/http';
import { FilesService } from '@services/files.service';
import { ApiService } from '@api/services';
import { NotFoundComponent } from '@components/view/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    SideBarComponent,
    FilesComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReduxModule,
    StoreModule.forRoot(rootReducer),
    FlexLayoutModule,
    AppRoutingModule,
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
  ],
  providers: [
    ApiService,
    FilesService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
