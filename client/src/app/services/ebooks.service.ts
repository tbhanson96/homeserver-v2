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

  uploadEbooks(sendToKindle: boolean, sendToTori: boolean, files: Array<File>) {
    const formData = {}; 
    files.forEach((file) => {
      formData[file.name] = file;
    });
    return this.apiService.ebookControllerAddEbook({ sendToKindle, sendToTori, body: formData }).pipe(share());
  }

  deleteEbook(ebook: EbookData) {
    return this.apiService.ebookControllerDeleteEbook({ body: ebook });
  }

  sendToKindle(ebook: EbookData, sendToTori = false) {
    return this.apiService.ebookControllerSendBookToKindle({ body: ebook, sendToTori });
  }

  searchForBooks(query: string) {
    return this.apiService.ebookControllerSearchEbooks({ search: query});
  }

  downloadBook(book: LibgenData, sendToKindle: boolean, sendToTori: boolean) {
    return this.apiService.ebookControllerDownloadEbook({ sendToKindle, sendToTori, body: book });
  }
}
