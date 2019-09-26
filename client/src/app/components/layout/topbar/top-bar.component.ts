import { Component, OnInit } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopbarComponent implements OnInit {
  private sidebarOpen = false;
  constructor(private readonly uiStateActions: UiStateActions) { }

  ngOnInit() {
  }

  onToggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.uiStateActions.toggleSidebar(this.sidebarOpen);
  }
}
