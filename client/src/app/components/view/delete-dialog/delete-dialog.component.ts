import { Component, OnInit, Inject } from '@angular/core';
import { FileData, EbookData } from '@api/models';
import { FilesService } from '@services/files.service';
import { UploadType } from '../upload-dialog/upload-type';
import { EbooksService } from '@services/ebooks.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {

  constructor(
    private fileService: FilesService,
    private ebookService: EbooksService,
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: UploadType, file: EbookData | FileData },
    ) { }

  ngOnInit() {
  }

  onDeleteFile() {
    let result;
    switch (this.data.service) {
      case UploadType.Files:
        result = this.fileService.deleteFile(<FileData>this.data.file);
        this.dialogRef.close(result);
        break;
      case UploadType.Ebooks:
        result = this.ebookService.deleteEbook(<EbookData>this.data.file);
        this.dialogRef.close(result);
        break;

    }
  }

}
