import { Component, OnInit, Input } from '@angular/core';
import { File } from 'app/models/File';
import { FilesService } from 'app/services/files.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  private currentDirectory: string;
  private currentFiles: File[];
  private showHiddenFiles: boolean;

  constructor(private filesService: FilesService) {
    this.showHiddenFiles = false;
  }

  ngOnInit() {
    this.filesService.getCurrentDirectory().subscribe((directory) => {
        this.currentDirectory = directory;
    });
  }

  public getFileData() {
    return [];
  }

  public updateDirectory(directory: string): void {
    this.filesService.setCurrentDirectory(directory);
  }


}
