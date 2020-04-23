import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { EbookControllerClient } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  constructor(private api: EbookControllerClient) { }

  getEbooks() {
    return this.api.getBooks();
  }

  uploadEbooks(sendToKindle: boolean, files: Array<File>) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(index.toString(), file, file.name);
    });
    return this.api.addEbook(sendToKindle, formData).pipe(share());
  }
}
