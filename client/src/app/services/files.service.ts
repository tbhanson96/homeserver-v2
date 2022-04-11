import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileData } from '@api/models';
import { ApiService } from '@api/services';
import { share, map } from 'rxjs/operators';
import { UploadInterceptor } from './upload.interceptor';
import { HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(
    private readonly api: ApiService,
    private readonly upload: UploadInterceptor,
    ) { }

  public getDirectory(filePath: string, showHiddenFiles: boolean): Observable<FileData[]> {
    return this.api.fileControllerGetPath({ path: filePath });
  }

  public getFile(filePath: string): Observable<any> {
    return this.api.fileControllerGetFile({ file: filePath });
  }

  public uploadFiles(files: File[], directory: string) {
    const formData = {};
    files.forEach(f => {
      formData[f.name] = f;
    });
    return this.api.fileControllerUploadFiles({ path: directory, body: formData }).pipe(share());
  }

  public deleteFile(file: FileData) {
    return this.api.fileControllerDeleteFile({ body: file }).pipe(share());
  }

  public renameFile(file: FileData, newName: string) {
    return this.api.fileControllerRenameFile({ name: newName, body: file }).pipe(share());
  }

  public getUploadProgress(): Observable<number> {
    return this.upload.getProgress().pipe(map(event => {
      if (event.type === HttpEventType.UploadProgress || event.type === HttpEventType.DownloadProgress) {
        return event.total ? Math.round((100 * event.loaded) / event.total) :  -1;
      } else {
        return -1;
      }
    }));
  }
}
