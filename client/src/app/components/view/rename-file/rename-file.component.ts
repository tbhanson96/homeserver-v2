import { Component, OnInit, Inject } from '@angular/core';
import { FileData } from '@api/models';
import { FilesService } from '@services/files.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rename-file',
  templateUrl: './rename-file.component.html',
  styleUrls: ['./rename-file.component.scss']
})
export class RenameFileComponent implements OnInit {

  public newFileName: string;

  constructor(
    private readonly fileService: FilesService,
    private dialogRef: MatDialogRef<RenameFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedFile: FileData},
  ) { }

  ngOnInit() {
  }

  public onRenameFile() {
    console.log(this.newFileName);
    if (!this.newFileName) {
      this.dialogRef.close();
    } else {
      const result = this.fileService.renameFile(this.data.selectedFile, this.newFileName)
      this.dialogRef.close(result);
    }
  }
}