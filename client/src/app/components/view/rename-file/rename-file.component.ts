import { Component, OnInit, Inject } from '@angular/core';
import { FileData } from '@api/models';
import { MdcDialogRef, MDC_DIALOG_DATA } from '@angular-mdc/web';
import { FilesService } from '@services/files.service';

@Component({
  selector: 'app-rename-file',
  templateUrl: './rename-file.component.html',
  styleUrls: ['./rename-file.component.scss']
})
export class RenameFileComponent implements OnInit {

  public newFileName: string;

  constructor(
    private readonly fileService: FilesService,
    private dialogRef: MdcDialogRef<RenameFileComponent>,
    @Inject(MDC_DIALOG_DATA) public data: { selectedFile: FileData},
  ) { }

  ngOnInit() {
  }

  public onRenameFile() {
    if (!this.newFileName) {
      this.dialogRef.close();
    } else {
      const result = this.fileService.renameFile(this.data.selectedFile, this.newFileName)
      this.dialogRef.close(result);
    }
  }
}