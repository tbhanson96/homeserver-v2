import { Component, OnInit } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { EbooksService } from '@services/ebooks.service';
import { EbookData } from '@api/models';
import { MdcDialog } from '@angular-mdc/web';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Observable } from 'rxjs';
import { UploadType } from '../upload-dialog/upload-type';

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
    private dialog: MdcDialog) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Ebooks');
    this.updateEbooks();
  }

  onUploadClick() {
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
