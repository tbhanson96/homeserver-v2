import { Injectable } from '@angular/core';
import { IAction } from '@actions/action';
import { Store } from '@ngrx/store';
import { IUiStateStore } from '@models/ui-state-store';

export type UiStateAction = IAction;

export enum UiStateActionType {
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
}

export class ToggleSidebarAction implements UiStateAction {
  readonly type = UiStateActionType.TOGGLE_SIDEBAR;
  constructor(public payload: { toggle: boolean }) { }
}

@Injectable()
export class UiStateActions {
  constructor(private readonly store: Store<IUiStateStore>) { }

  toggleSidebar(toggle: boolean) {
    this.store.dispatch(new ToggleSidebarAction({ toggle }));
  }
}
