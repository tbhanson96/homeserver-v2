import { Component, OnInit, OnDestroy } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { Subscription } from 'rxjs';
import { UiStateSelectors } from '@selectors/ui-state.selectors';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  shownComponent: string;
  sidebarOpen: boolean;
  subscriptions: Subscription[];
  constructor(
    private readonly uiStateActions: UiStateActions,
    private readonly uiSelectors: UiStateSelectors,
    ) { }

  ngOnInit() {
    this.subscriptions = [
      this.uiSelectors.getCurrentApp().subscribe(app => {
        this.shownComponent = app;
      }),
      this.uiSelectors.getSidebarOpen().subscribe(open => {
        this.sidebarOpen = open;
      })
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onToggleSidebar() {
    this.uiStateActions.toggleSidebar(!this.sidebarOpen);
  }
}
