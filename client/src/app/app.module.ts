import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER, forwardRef } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from '@components/layout/main/home.component';
import { TopbarComponent } from '@components/layout/topbar/top-bar.component';
import { SideBarComponent } from '@components/layout/side-bar/side-bar.component';
import { ReduxModule } from './redux.module';
import { StoreModule } from '@ngrx/store';
import { rootReducer, initialState } from '@reducers/root.reducer';
import { FilesComponent } from '@components/view/files/files.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FilesService } from '@services/files.service';
import { ApiService } from '@api/services';
import { NotFoundComponent } from '@components/view/not-found/not-found.component';
import { MaterialModule } from './material.module';
import { SnackbarErrorService } from '@services/snackbar-error.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadDialogComponent } from '@components/view/upload-dialog/upload-dialog.component';
import { AuthComponent } from '@components/view/auth/auth.component';
import { AppComponent } from '@components/app.component';
import { AuthService } from '@services/auth.service';
import { AuthInterceptor } from '@services/auth.interceptor';
import { EbooksComponent } from '@components/view/ebooks/ebooks.component';
import { EbooksService } from '@services/ebooks.service';
import { DeleteDialogComponent } from '@components/view/delete-dialog/delete-dialog.component';
import { SettingsComponent } from '@components/view/settings/settings.component';
import { UiStateActions } from '@actions/ui-state.actions';
import { RenameFileComponent } from '@components/view/rename-file/rename-file.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TorrentsComponent } from '@components/view/torrents/torrents.component';
import { TorrentsService } from '@services/torrents.service';
import { FileSizePipe } from './pipes/fileSizePipe';
import { UploadInterceptor } from '@services/upload.interceptor';

@NgModule({
  declarations: [
    HomeComponent,
    TopbarComponent,
    SideBarComponent,
    FilesComponent,
    NotFoundComponent,
    UploadDialogComponent,
    AuthComponent,
    AppComponent,
    EbooksComponent,
    DeleteDialogComponent,
    SettingsComponent,
    RenameFileComponent,
    TorrentsComponent,
    FileSizePipe,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    ReduxModule,
    StoreModule.forRoot(rootReducer, { initialState }),
    FlexLayoutModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (apiService: ApiService, uiActions: UiStateActions) => {
        return () => {
          return new Promise<void>((res, rej) => {
            apiService.settingsControllerGetSettings().subscribe({
              next: settings => {
                uiActions.setDarkMode(settings.useDarkMode);
                res();
              }, error: e => {
                rej(e);
              }
            });
          });
        };
      },
      deps: [ApiService, UiStateActions],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: UploadInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: SnackbarErrorService
    },
    DeviceDetectorService,
    ApiService,
    FilesService,
    AuthService,
    EbooksService,
    TorrentsService,
    UploadInterceptor,
  ],
  entryComponents: [
    UploadDialogComponent,
    DeleteDialogComponent,
    SettingsComponent,
    RenameFileComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
