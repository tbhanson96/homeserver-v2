import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppStore } from '@models/app-store';

@Injectable()
export class UiStateSelectors {
  constructor(private readonly store: Store<AppStore>) { }

  getSidebarOpen(): Observable<boolean> {
    return this.store.pipe(select(state => state.uiStateStore.sidebarOpen));
  }

  getAppBusy(): Observable<boolean> {
    return this.store.pipe(select(state => state.uiStateStore.appBusy));
  }

  getCurrentApp(): Observable<string> {
    return this.store.pipe(select(state => state.uiStateStore.currentApp));
  }

  getCurrentFilesDirectory(): Observable<string> {
    return this.store.pipe(select(state => state.uiStateStore.currentFilesDirectory));
  }
}
