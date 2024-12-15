import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { FileData, StatusUpdate, StatusChannel, StatusType } from '@api/models';
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

  public downloadFolder(filePath: string): Promise<Blob> {
    return lastValueFrom(this.api.fileControllerDownloadFolder({ path: filePath }));
  };

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

  public getUploadProgress(): Observable<StatusUpdate> {
    return this.upload.getProgress().pipe(map(event => {
      let progress = -1;
      let status: StatusType = 'InProgress';
      if (event.type === HttpEventType.UploadProgress || event.type === HttpEventType.DownloadProgress) {
        progress = event.total ? Math.round((100 * event.loaded) / event.total) :  -1;
        if (progress === 100) {
          status = 'Done';
        }
      }
      return {
        channel: 'FileUpload',
        progress,
        status,
      };
    }));
  }
}
