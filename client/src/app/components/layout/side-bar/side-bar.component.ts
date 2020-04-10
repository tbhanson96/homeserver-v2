import { Component } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {

  constructor(private uiActions: UiStateActions) { }

  onNavigatePage() {
    // TODO: figure out how to only do this if sidebar is in 'dismissible' mode
    // this.uiActions.toggleSidebar(false);
  }

}
