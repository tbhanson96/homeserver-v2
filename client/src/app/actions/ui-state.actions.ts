import { Injectable } from '@angular/core';
import { IAction } from '@actions/action';
import { Store } from '@ngrx/store';
import { UiStateStore } from '@models/ui-state-store';

export type UiStateAction = IAction;

export enum UiStateActionType {
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
    SET_APP_BUSY = 'SET_APP_BUSY',
    SET_CURRENT_APP = 'SET_CURRENT_APP',
    SET_CURRENT_FILES_DIRECTORY = 'SET_CURRENT_FILES_DIRECTORY',
    SET_DARK_MODE = 'SET_DARK_MODE',
    SET_SHOW_HIDDEN_FILES = 'SET_SHOW_HIDDEN_FILES',
}

export class ToggleSidebarAction implements UiStateAction {
  readonly type = UiStateActionType.TOGGLE_SIDEBAR;
  constructor(public payload: { toggle: boolean }) { }
}

export class SetAppBusyAction implements UiStateAction {
  readonly type = UiStateActionType.SET_APP_BUSY;
  constructor(public payload: { busy: boolean }) { }
}

export class SetCurrentAppAction implements UiStateAction {
  readonly type = UiStateActionType.SET_CURRENT_APP;
  constructor(public payload: { currentApp: string }) { }
}

export class SetCurrentFilesDirectory implements UiStateAction {
  readonly type = UiStateActionType.SET_CURRENT_FILES_DIRECTORY;
  constructor(public payload: { currentFilesDirectory: string }) { }
}

export class SetDarkModeAction implements UiStateAction {
  readonly type = UiStateActionType.SET_DARK_MODE;
  constructor(public payload: { useDarkMode: boolean }) { }
}

export class SetShowHiddenFiles implements UiStateAction {
  readonly type = UiStateActionType.SET_SHOW_HIDDEN_FILES;
  constructor(public payload: { showHiddenFiles: boolean }) { }
}


@Injectable()
export class UiStateActions {
  constructor(private readonly store: Store<UiStateStore>) { }

  toggleSidebar(toggle: boolean) {
    this.store.dispatch(new ToggleSidebarAction({ toggle }));
  }

  setAppBusy(busy: boolean) {
    this.store.dispatch(new SetAppBusyAction({ busy }));
  }

  setCurrentApp(currentApp: string) {
    this.store.dispatch(new SetCurrentAppAction({ currentApp }));
  }

  setCurrentFilesDirectory(currentFilesDirectory: string) {
    this.store.dispatch(new SetCurrentFilesDirectory({ currentFilesDirectory }));
  }

  setDarkMode(darkMode: boolean) {
    this.store.dispatch(new SetDarkModeAction({ useDarkMode: darkMode }));
  }
  
  setShowHiddenFiles(showHiddenFiles: boolean) {
    this.store.dispatch(new SetShowHiddenFiles({ showHiddenFiles }));
  }
}
