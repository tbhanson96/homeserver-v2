import { Component, OnInit } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { EbooksService } from '@services/ebooks.service';
import { EbookData } from '@api/models';
import { MdcDialog, MdcSnackbar } from '@angular-mdc/web';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Observable } from 'rxjs';
import { UploadType } from '../upload-dialog/upload-type';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

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
    private dialog: MdcDialog,
    private snackbar: MdcSnackbar,
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
        result.subscribe(() => {
          this.updateEbooks();
        }, () => {
          this.uiActions.setAppBusy(false);
        });
      }
    });
  }

  public onDeleteFile(event: Event, file: EbookData) {
    event.preventDefault();
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: file });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe(() => {
          this.snackbar.open(`Successfully remove ebook from libary: ${file.name}`);
          this.updateEbooks();
        }, () => {
          this.uiActions.setAppBusy(false);
          throw new Error(`Failed to remove ebook from library: ${file.name}`);
        });
      }
    });
  }

  private updateEbooks() {
    this.uiActions.setAppBusy(true);
    this.ebooksService.getEbooks().subscribe(ebooks => {
      this.ebooks = ebooks;
      this.uiActions.setAppBusy(false);
    }, e => {
      this.uiActions.setAppBusy(false);
      throw e;
    });
  }
}
