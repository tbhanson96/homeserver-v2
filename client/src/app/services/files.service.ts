import * as util from 'util';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileData } from '@api/models';
import { ApiService } from '@api/services';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private readonly api: ApiService) { }

  public getDirectory(filePath: string, showHiddenFiles: boolean): Observable<FileData[]> {
    return this.api.getApiFilesPath(filePath);
  }

  public getFile(filePath: string): Observable<any> {
    return this.api.getApiFilesFile(filePath);
  }

  public uploadFiles(files: Array<File>, directory: string) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(index.toString(), file, file.name);
    });
    return this.api.postApiFilesFile(directory, formData).pipe(share());
  }

  public deleteFile(file: FileData) {
    return this.api.deleteApiFilesFile(file).pipe(share());
  }

  public renameFile(file: FileData, newName: string) {
    return this.api.putApiFilesFile(newName, file).pipe(share());
  }
}
