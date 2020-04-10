import { UiStateStore } from '@models/ui-state-store';
import { UiStateAction, UiStateActionType } from '@actions/ui-state.actions';
import * as UiStateActions from '@actions/ui-state.actions';

export const uiStateStoreInitialState: UiStateStore = {
    sidebarOpen: false,
    appBusy: false,
    currentApp: 'Files',
    currentFilesDirectory: '/'
};

export function uiStateReducer(state: UiStateStore = uiStateStoreInitialState, action: UiStateAction): UiStateStore {
  switch (action.type) {
    case UiStateActionType.TOGGLE_SIDEBAR: {
      const { toggle } = (action as UiStateActions.ToggleSidebarAction).payload;
      return { ...state, sidebarOpen: toggle };
    }
    case UiStateActionType.SET_APP_BUSY: {
      const { busy } = (action as UiStateActions.SetAppBusyAction).payload;
      return { ...state, appBusy: busy }
    }
    case UiStateActionType.SET_CURRENT_APP: {
      const { currentApp } = (action as UiStateActions.SetCurrentAppAction).payload;
      return { ...state, currentApp }
    }
    case UiStateActionType.SET_CURRENT_FILES_DIRECTORY: {
      const { currentFilesDirectory } = (action as UiStateActions.SetCurrentFilesDirectory).payload;
      return { ...state, currentFilesDirectory }
    } 
    default:
      return state;
  }
}
