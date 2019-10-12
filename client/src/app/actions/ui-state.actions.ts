import { Injectable } from '@angular/core';
import { IAction } from '@actions/action';
import { Store } from '@ngrx/store';
import { IUiStateStore } from '@models/ui-state-store';

export type UiStateAction = IAction;

export enum UiStateActionType {
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
    SET_APP_BUSY = 'SET_APP_BUSY',
}

export class ToggleSidebarAction implements UiStateAction {
  readonly type = UiStateActionType.TOGGLE_SIDEBAR;
  constructor(public payload: { toggle: boolean }) { }
}

export class SetAppBusyAction implements UiStateAction {
  readonly type = UiStateActionType.SET_APP_BUSY;
  constructor(public payload: { busy: boolean }) { }
}

@Injectable()
export class UiStateActions {
  constructor(private readonly store: Store<IUiStateStore>) { }

  toggleSidebar(toggle: boolean) {
    this.store.dispatch(new ToggleSidebarAction({ toggle }));
  }

  setAppBusy(busy: boolean) {
    this.store.dispatch(new SetAppBusyAction({ busy }));
  }
}
