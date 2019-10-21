import { NgModule } from "@angular/core";
import {
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
    MdcSnackbarModule,
    MdcFabModule,
    MdcDialogModule,
    MdcTextFieldModule,
    MdcIconButtonModule,
 } from '@angular-mdc/web';

@NgModule({
  exports: [
    MdcTopAppBarModule,
    MdcIconModule,
    MdcIconButtonModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
    MdcSnackbarModule,
    MdcFabModule,
    MdcDialogModule,
    MdcTextFieldModule,
  ]
})
export class MaterialModule { }