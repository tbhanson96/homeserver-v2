import { Component } from '@angular/core';
import { UiStateSelectors } from '@selectors/ui-state.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private subscriptions = [];
  private isOpen = true;
  constructor(private readonly uiStateSelectors: UiStateSelectors) { }

  ngOnInit() {
    this.subscriptions = [
      this.uiStateSelectors.getSidebarOpen().subscribe(open => {
        this.isOpen = open;
      }),
    ]

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe);
  }
}
