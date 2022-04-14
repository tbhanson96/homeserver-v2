import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';
import { share } from 'rxjs/operators';
import { EbookData, LibgenData } from '@api/models';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  constructor(private apiService: ApiService) { }

  getEbooks() {
    return this.apiService.ebookControllerGetBooks();
  }

  uploadEbooks(sendToKindle: boolean, files: Array<File>) {
    const formData = {}; 
    files.forEach((file) => {
      formData[file.name] = file;
    });
    return this.apiService.ebookControllerAddEbook({ sendToKindle, body: formData }).pipe(share());
  }

  deleteEbook(ebook: EbookData) {
    return this.apiService.ebookControllerDeleteEbook({ body: ebook });
  }

  sendToKindle(ebook: EbookData) {
    return this.apiService.ebookControllerSendBookToKindle({ body: ebook });
  }

  searchForBooks(query: string) {
    return this.apiService.ebookControllerSearchEbooks({ search: query});
  }

  downloadBook(book: LibgenData, sendToKindle: boolean) {
    return this.apiService.ebookControllerDownloadEbook({ sendToKindle, body: book });
  }
}
