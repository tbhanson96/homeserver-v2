import { UiStateStore } from '@models/ui-state-store';
import { UiStateAction, UiStateActionType } from '@actions/ui-state.actions';
import * as UiStateActions from '@actions/ui-state.actions';

export const uiStateStoreInitialState: UiStateStore = {
    sidebarOpen: true,
    appBusy: false,
    currentApp: 'Files',
    currentFilesDirectory: '/',
    useDarkMode: false,
    showHiddenFiles: false,
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
    case UiStateActionType.SET_DARK_MODE: {
      const { useDarkMode } = (action as UiStateActions.SetDarkModeAction).payload;
      return { ...state, useDarkMode };
    }
    case UiStateActionType.SET_SHOW_HIDDEN_FILES: {
      const { showHiddenFiles } = (action as UiStateActions.SetShowHiddenFiles).payload;
      return { ...state, showHiddenFiles };
    }
    default:
      return state;
  }
}
