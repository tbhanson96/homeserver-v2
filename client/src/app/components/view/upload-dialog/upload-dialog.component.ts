import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FilesService } from '@services/files.service';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { Subscription, Observable } from 'rxjs';
import { EbooksService } from '@services/ebooks.service';
import { UploadType } from './upload-type';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-upload-dialog',
    templateUrl: './upload-dialog.component.html',
    styleUrls: ['./upload-dialog.component.scss'],
    standalone: false
})
export class UploadDialogComponent implements OnInit, OnDestroy {
  files = new Array<File>();
  uploadForm = new FormGroup({
    files: new FormControl(),
  });
  currentDirectory = '/';
  sendToKindle = false;
  sendToTori = false;
  uploadServiceEnum = UploadType;
  private subscriptions: Subscription[];

  public get dialogTitle() {
    return this.uploadService === UploadType.Ebooks ? 'Upload Ebooks' : 'Upload Files';
  }

  public get dialogSubtitle() {
    return this.uploadService === UploadType.Ebooks
      ? 'Add books to your library and optionally send them to Kindle.'
      : `Add files to ${this.currentDirectory}.`;
  }

  public get hasFiles() {
    return this.files.length > 0;
  }

  constructor(
    private readonly fileService: FilesService,
    private readonly ebookService: EbooksService,
    private readonly snackbar: MatSnackBar,
    private readonly uiSelectors: UiStateSelectors,
    private readonly dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly uploadService: UploadType ) { }

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
        result = this.ebookService.uploadEbooks(this.sendToKindle, this.sendToTori, this.files);
        break;
    }

    const msg = this.files.map(f => f.name).join(', ');
    result.subscribe({
      next: () => {
        this.snackbar.open(`Successfully uploaded files: ${msg}`, 'Close');
      },
      error: () => {
        throw new Error(`Failed to upload files: ${msg}`);
      }
    });
    this.dialogRef.close(result);
  }

  onSendToKindleInput(input: boolean) {
    this.sendToKindle = input;
  }

  onSendToToriInput(input: boolean) {
    this.sendToTori = input;
  }

}
