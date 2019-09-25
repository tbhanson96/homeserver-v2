import { IUiStateStore } from '@models/ui-state-store';
import { UiStateAction, UiStateActionType } from '@actions/ui-state.actions';
import * as UiStateActions from '@actions/ui-state.actions';

const initialState: IUiStateStore = {
    sidebarOpen: true,
};

export default function uiStateReducer(state: IUiStateStore = initialState, action: UiStateAction): IUiStateStore {
  switch (action.type) {
    case UiStateActionType.TOGGLE_SIDEBAR: {
      const { toggle } = (action as UiStateActions.ToggleSidebarAction).payload;
      return { ...state, sidebarOpen: toggle };
    }
    default:
      return state;
  }
}
