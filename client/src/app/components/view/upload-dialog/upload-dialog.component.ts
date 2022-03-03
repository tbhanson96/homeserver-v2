import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FilesService } from '@services/files.service';
import { MdcDialogRef, MdcSnackbar, MDC_DIALOG_DATA } from '@angular-mdc/web';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { Subscription, Observable } from 'rxjs';
import { EbooksService } from '@services/ebooks.service';
import { UploadType } from './upload-type';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit, OnDestroy {
  files = new Array<File>();
  uploadForm = new FormGroup({
    files: new FormControl(),
  });
  currentDirectory = '/';
  sendToKindle = false;
  uploadServiceEnum = UploadType;
  private subscriptions: Subscription[];
  constructor(
    private readonly fileService: FilesService,
    private readonly ebookService: EbooksService,
    private readonly snackbar: MdcSnackbar,
    private readonly uiSelectors: UiStateSelectors,
    private readonly dialogRef: MdcDialogRef<UploadDialogComponent>,
    @Inject(MDC_DIALOG_DATA) public readonly uploadService: UploadType ) { }

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
    this.files = [];
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

  onDeleteFile(file: File) {
    this.files = this.files.filter(f => f.name !== file.name);
  }

  onUploadFiles() {
    let result: Observable<void>;
    switch (this.uploadService) {
      case UploadType.Files:
        result = this.fileService.uploadFiles(this.files, this.currentDirectory);
        break;
      case UploadType.Ebooks:
        result = this.ebookService.uploadEbooks(this.sendToKindle, this.files);
        break;
    }

    const msg = this.files.map(f => f.name).join(', ');
    result.subscribe(() => {
      this.snackbar.open(`Successfully uploaded files: ${msg}`);
    }, () => {
      throw new Error(`Failed to upload files: ${msg}`);
    });
    this.dialogRef.close(result);
  }

  onSendToKindleInput(input: boolean) {
    this.sendToKindle = input;
  }

}
