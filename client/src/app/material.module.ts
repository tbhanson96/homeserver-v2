import { NgModule } from "@angular/core";
import {
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
 } from '@angular-mdc/web';

@NgModule({
  exports: [
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
    MdcLinearProgressModule,
  ]
})
export class MaterialModule { }