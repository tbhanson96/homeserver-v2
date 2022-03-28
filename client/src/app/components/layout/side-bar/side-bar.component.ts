import { Component, OnInit } from '@angular/core';
import { SettingsComponent } from '@components/view/settings/settings.component';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  constructor(
    private readonly dialog: MatDialog,
    private readonly snackbar: MatSnackBar,
    ) { }
  

  onNavigatePage() {
    // TODO: figure out how to only do this if sidebar is in 'dismissible' mode
    // this.uiActions.toggleSidebar(false);
  }

  onOpenSettings() {
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
