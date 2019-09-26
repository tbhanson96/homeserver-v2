import { NgModule } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { UiStateSelectors } from '@selectors/ui-state.selectors';

@NgModule({
  providers: [
    UiStateActions,
    UiStateSelectors,
  ]
})
export class ReduxModule { }
