import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  constructor(private apiService: ApiService) { }

  getEbooks() {
    return this.apiService.getApiEbooks();
  }

  uploadEbooks(sendToKindle: boolean, files: Array<File>) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(index.toString(), file, file.name);
    });
    return this.apiService.postApiEbooks(sendToKindle, formData);
  }
}
