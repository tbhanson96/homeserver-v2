import { uiStateReducer, uiStateStoreInitialState }from './ui-state.reducer';
import { AppStore } from '@models/app-store';

export const initialState: AppStore = {
    uiStateStore: uiStateStoreInitialState,
}

export const rootReducer = {
    uiStateStore: uiStateReducer,
}