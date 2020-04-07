import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FilesService } from '@services/files.service';
import { MdcDialogRef, MdcSnackbar } from '@angular-mdc/web';
import { UiStateActions } from '@actions/ui-state.actions';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit, OnDestroy {
  files = new Array<any>();
  uploadForm = new FormGroup({
    files: new FormControl(),
  })
  currentDirectory = '/';
  private subscriptions: Subscription[];
  constructor(
    private readonly fileService: FilesService,
    private readonly uiSelectors: UiStateSelectors,
    private readonly snackbar: MdcSnackbar,
    private readonly uiActions: UiStateActions) { }

  ngOnInit() {
    this.subscriptions = [
      this.uiSelectors.getCurrentFilesDirectory().subscribe(dir => {
        this.currentDirectory = dir;
      }),
    ]
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onFileInput(event: any) {
    this.files.push(...event.srcElement.files);
  }

  getFileSize(size: number): string {
    let count = 0;
    const units = ['B', 'kB', 'mB', 'gB'];
    while (size / 1024 > 1) {
      size /= 1024;
      count++;
    }
    return size.toFixed(3) + ' ' + units[count];
  }

  onDeleteFile(file: any) {
    this.files = this.files.filter(f => f.name !== file.name);
  }

  onUploadFiles() {
    this.uiActions.setAppBusy(true);
    this.fileService.uploadFiles(this.files, this.currentDirectory).subscribe(() => {
      this.uiActions.setAppBusy(false);
      let msg = this.files.map(f => f.name).join(", ");
      this.snackbar.open(`Successfully uploaded file(s): ${msg}`);
    });
  }

}