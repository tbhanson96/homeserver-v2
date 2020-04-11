import { Component, OnInit, Inject } from '@angular/core';
import { MdcDialogRef, MDC_DIALOG_DATA, MdcSnackbar } from '@angular-mdc/web';
import { FileData } from '@api/models';
import { FilesService } from '@services/files.service';

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
    @Inject(MDC_DIALOG_DATA) public data: FileData ) { }

  ngOnInit() {
  }

  onDeleteFile() {
    const result = this.fileService.deleteFile(this.data);
    this.dialogRef.close(result);
  }

}
