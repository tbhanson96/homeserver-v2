import { IUiStateStore } from '@models/ui-state-store';
import { UiStateAction, UiStateActionType } from '@actions/ui-state.actions';
import * as UiStateActions from '@actions/ui-state.actions';

const initialState: IUiStateStore = {
    sidebarOpen: true,
    appBusy: true,
};

export default function uiStateReducer(state: IUiStateStore = initialState, action: UiStateAction): IUiStateStore {
  switch (action.type) {
    case UiStateActionType.TOGGLE_SIDEBAR: {
      const { toggle } = (action as UiStateActions.ToggleSidebarAction).payload;
      return { ...state, sidebarOpen: toggle };
    }
    case UiStateActionType.SET_APP_BUSY: {
      const { busy } = (action as UiStateActions.SetAppBusyAction).payload;
      return { ...state, appBusy: busy }
    }
    default:
      return state;
  }
}
