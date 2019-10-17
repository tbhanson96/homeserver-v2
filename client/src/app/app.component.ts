import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { UiStateActions } from '@actions/ui-state.actions';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  private subscriptions = [];
  private isOpen = true;
  private isBusy = false;
  constructor(private readonly uiStateSelectors: UiStateSelectors) { }

  ngOnInit() {
    this.subscriptions = [
      this.uiStateSelectors.getAppBusy().subscribe(busy => {
        this.isBusy = busy;
      })
    ]
  }

  ngAfterViewInit() {
    this.isBusy = false;
    this.subscriptions.push(
      this.uiStateSelectors.getSidebarOpen().subscribe(open => {
        this.isOpen = open;
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe);
  }
}
