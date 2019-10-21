import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions = [];
  private isOpen = false;
  private isBusy = false;
  constructor(
    private readonly uiStateSelectors: UiStateSelectors,
    private readonly uiActions: UiStateActions,
    ) { }

  ngOnInit() {
    this.subscriptions = [
      this.uiStateSelectors.getAppBusy().subscribe(busy => {
        this.isBusy = busy;
      })
    ];
  }

  ngAfterViewInit() {
    this.isBusy = false;
    this.subscriptions.push(
      this.uiStateSelectors.getSidebarOpen().subscribe(open => {
        this.isOpen = open;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe);
  }

  onSidebarChanged(opened: boolean) {
    if (opened !== this.isOpen) {
      this.uiActions.toggleSidebar(opened);
    }
  }

  onDrawerChange(type: string) {
    if (type === 'dismissible') {
      this.uiActions.toggleSidebar(true);
    } else {
      this.uiActions.toggleSidebar(false);
    }
  }
}
