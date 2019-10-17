import { NgModule } from "@angular/core";
import {
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
    MdcSnackbarModule,
 } from '@angular-mdc/web';

@NgModule({
  exports: [
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
    MdcSnackbarModule,
  ]
})
export class MaterialModule { }