import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { ApiService } from '@api/services';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  constructor(private readonly api: ApiService) { }

  getEbooks() {
    return this.api.ebookControllerGetBooks();
  }

  uploadEbooks(sendToKindle: boolean, files: Array<File>) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(index.toString(), file, file.name);
    });
    return this.api.ebookControllerAddEbook({ sendToKindle, body: formData }).pipe(share());
  }
}
