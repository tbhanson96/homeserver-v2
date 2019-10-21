import { Component, OnInit, HostBinding } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FilesService } from '@services/files.service';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit {
  files = new Array<any>();
  uploadForm = new FormGroup({
    files: new FormControl(),
  })
  constructor(private readonly fileService: FilesService) { }

  ngOnInit() {
  }

  onFileInput(event: any) {
    this.files.push(...event.srcElement.files)
  }

  getFileSize(size: number): string {
    let count = 0;
    const units = ["B", "kB", "mB", "gB"];
    while (size / 1024 > 1) {
      size /= 1024;
      count++;
    }
    return size.toFixed(3) + " " + units[count];
  }

  onDeleteFile(file: any) {
    this.files = this.files.filter(f => f.name !== file.name);
  }

  onUploadFiles() {
    this.fileService.uploadFiles(this.files, '/Documents');
  }

}