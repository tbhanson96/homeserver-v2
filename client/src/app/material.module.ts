import { NgModule } from "@angular/core";
import {
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
 } from '@angular-mdc/web';

@NgModule({
  exports: [
    MdcTopAppBarModule,
    MdcIconModule,
    MdcDrawerModule,
    MdcListModule,
  ]
})
export class MaterialModule { }