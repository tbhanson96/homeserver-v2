import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileData } from '@api/models';
import { ApiService } from '@api/services';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private readonly api: ApiService) { }

  public getDirectory(filePath: string, showHiddenFiles: boolean): Observable<FileData[]> {
    return this.api.getApiFilesPath({ path: filePath, includeHidden: showHiddenFiles });
  }

  public getFile(filePath: string): Observable<any> {
    return this.api.getApiFilesFile(filePath);
  }

  public uploadFiles(files: Array<any>, directory: string) {
    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(file);
      formData.append(index.toString(), file, file.name);
    });
    this.api.postApiFilesFile({ files: formData, directory })
    console.log(formData);
  }
}
