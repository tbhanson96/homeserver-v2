import { SetDarkModeAction, ToggleSidebarAction } from '@actions/ui-state.actions';
import { uiStateReducer, uiStateStoreInitialState } from './ui-state.reducer';

describe('uiStateReducer', () => {
  it('updates state without mutating the previous value', () => {
    const sidebarState = uiStateReducer(
      uiStateStoreInitialState,
      new ToggleSidebarAction({ toggle: false }),
    );
    const darkModeState = uiStateReducer(
      sidebarState,
      new SetDarkModeAction({ useDarkMode: true }),
    );

    expect(sidebarState).not.toBe(uiStateStoreInitialState);
    expect(uiStateStoreInitialState.sidebarOpen).toBe(true);
    expect(darkModeState.sidebarOpen).toBe(false);
    expect(darkModeState.useDarkMode).toBe(true);
  });
});
