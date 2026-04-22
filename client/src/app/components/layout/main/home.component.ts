import { Component, OnInit, OnDestroy } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { DeviceDetectorService } from 'ngx-device-detector';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('shellMotion', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(12px)' }),
                animate('280ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
    ],
    standalone: false
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
    ) { }

  ngOnInit() {
    this.isMobile = this.deviceService.isMobile();
    if (this.isMobile) {
      this.uiActions.toggleSidebar(false);
    }
    this.subscriptions = [
      this.uiStateSelectors.getAppBusy().subscribe(busy => {
        this.isBusy = busy;
      }),
      this.uiStateSelectors.getSidebarOpen().subscribe(open => {
        this.isOpen = open;
      }),
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe);
  }
}
