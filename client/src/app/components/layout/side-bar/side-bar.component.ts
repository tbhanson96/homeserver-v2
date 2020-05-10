import { Component, OnInit } from '@angular/core';
import { MdcDialog } from '@angular-mdc/web';
import { SettingsComponent } from '@components/view/settings/settings.component';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  constructor(
    private readonly dialog: MdcDialog,
    ) { }
  

  onNavigatePage() {
    // TODO: figure out how to only do this if sidebar is in 'dismissible' mode
    // this.uiActions.toggleSidebar(false);
  }

  onOpenSettings() {
    const dialogRef = this.dialog.open(SettingsComponent);
  }

}
