import { Component, OnInit, Inject } from '@angular/core';
import { MdcDialogRef, MDC_DIALOG_DATA, MdcSnackbar } from '@angular-mdc/web';
import { FileData, EbookData } from '@api/models';
import { FilesService } from '@services/files.service';
import { UploadType } from '../upload-dialog/upload-type';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {

  constructor(
    private fileService: FilesService,
    private snackbar: MdcSnackbar,
    private dialogRef: MdcDialogRef<DeleteDialogComponent>,
    @Inject(MDC_DIALOG_DATA) public data: { service: UploadType, file: EbookData | FileData }) { }

  ngOnInit() {
  }

  onDeleteFile() {
    switch (this.data.service) {
      case UploadType.Files:
        const result = this.fileService.deleteFile(<FileData>this.data.file);
        this.dialogRef.close(result);
        break;
      case UploadType.Ebooks:

    }
  }

}
