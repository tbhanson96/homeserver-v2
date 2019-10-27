import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions = [];
  isOpen = false;
  isBusy = false;
  constructor(
    private readonly uiStateSelectors: UiStateSelectors,
    private readonly uiActions: UiStateActions,
    private readonly authService: AuthService,
    private readonly router: Router,
    ) { }

  ngOnInit() {
    this.authService.getAuthenticated().subscribe(authed => {
      if (!authed) {
        this.router.navigateByUrl('/login');
      }
    });
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
