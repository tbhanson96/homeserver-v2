import { NgModule } from "@angular/core";
import {
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
 } from '@angular-mdc/web';

@NgModule({
  exports: [
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
    MdcChipsModule,
  ]
})
export class MaterialModule { }