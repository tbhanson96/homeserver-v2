import { Component, OnInit } from '@angular/core';
import { SettingsComponent } from '@components/view/settings/settings.component';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UiStateActions } from '@actions/ui-state.actions';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackbar: MatSnackBar,
    private readonly device: DeviceDetectorService,
    private readonly ui: UiStateActions,
    ) { }

  onNavigatePage() {
    if (this.device.isMobile()) {
      this.ui.toggleSidebar(false);
    }
  }

  onOpenSettings() {
    this.onNavigatePage();
    const dialogRef = this.dialog.open(SettingsComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        result.subscribe({
          next: () => {
            this.snackbar.open('Succesfully performed update. Please refresh page.');
          },
          error: err => {
            throw new Error('Failed to apply update.');
          }
        });
      }
    });
  }

}
