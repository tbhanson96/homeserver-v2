import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileData } from '@api/models';
import { ApiService } from '@api/services';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private readonly api: ApiService) { }

  public getDirectory(filePath: string): Observable<FileData[]> {
    return this.api.getApiFilesPath(filePath);
  }

  public async getFile(filePath: string) {
  }
}
