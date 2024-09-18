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
import { ProgressDialogComponent } from './components/view/progress-dialog/progress-dialog.component';
import { LibgenComponent } from '@components/view/ebooks/libgen/libgen.component';
import { StatusService } from '@services/status.service';
import { LazyImgComponent } from './components/view/lazy-img/lazy-img.component';
import { HealthComponent } from '@components/view/health/health.component';
import { HealthService } from '@services/health.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@dhutaryan/ngx-mat-timepicker';

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
    ProgressDialogComponent,
    LibgenComponent,
    HealthComponent,
    LazyImgComponent,
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
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    MatFormFieldModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (apiService: ApiService, uiActions: UiStateActions, status: StatusService) => {
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
    HealthService,
    UploadInterceptor,
    StatusService,
  ],
  bootstrap: [
    AppComponent,
    UploadDialogComponent,
    DeleteDialogComponent,
    SettingsComponent,
    RenameFileComponent,
    ProgressDialogComponent,
  ]
})
export class AppModule { }
