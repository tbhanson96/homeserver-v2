import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  isOpen = false;
  isBusy = false;
  isMobile = false;
  constructor(
    private readonly deviceService: DeviceDetectorService,
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
      }),
      this.uiStateSelectors.getSidebarOpen().subscribe(open => {
        this.isOpen = open;
      }),
    ];
    this.isMobile = this.deviceService.isMobile();
    if (this.isMobile) {
      this.uiActions.toggleSidebar(false);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe);
  }

  onSidebarChanged(opened: boolean) {
    if (opened !== this.isOpen) {
      this.uiActions.toggleSidebar(opened);
    }
  }
}
