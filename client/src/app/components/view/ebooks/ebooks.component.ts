import { Component, OnInit } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { EbooksService } from '@services/ebooks.service';
import { EbookData } from '@api/models';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Observable } from 'rxjs';
import { UploadType } from '../upload-dialog/upload-type';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-ebooks',
  templateUrl: './ebooks.component.html',
  styleUrls: ['./ebooks.component.scss']
})
export class EbooksComponent implements OnInit {

  ebooks: EbookData[];
  constructor(
    private uiActions: UiStateActions,
    private ebooksService: EbooksService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    ) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Ebooks');
    this.updateEbooks();
  }

  public onUploadClick() {
    const dialogRef = this.dialog.open(UploadDialogComponent, { data: UploadType.Ebooks });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.updateEbooks();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
          },
        });
      }
    });
  }

  public onDeleteFile(event: Event, file: EbookData) {
    event.preventDefault();
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { service: UploadType.Ebooks, file }});
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.snackbar.open(`Successfully remove ebook from libary: ${file.name}`);
            this.updateEbooks();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
            throw new Error(`Failed to remove ebook from library: ${file.name}`);
          },
        });
      }
    });
  }

  public onShowEbookOptions(event: Event, menu: MatMenu) {
    event.preventDefault();
    // menu.cl = !menu.open;
  }

  private updateEbooks() {
    this.uiActions.setAppBusy(true);
    this.ebooksService.getEbooks().subscribe({
      next: ebooks => {
        this.ebooks = ebooks;
        this.uiActions.setAppBusy(false);
      },
      error: e => {
        this.uiActions.setAppBusy(false);
        throw e;
      },
    });
  }
}
