import { Injectable } from '@angular/core';
import { EbookService as GeneratedEbookService } from '@api/services';
import { share } from 'rxjs/operators';
import { EbookData, LibgenData } from '@api/models';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  constructor(private readonly ebookApi: GeneratedEbookService) { }

  getEbooks() {
    return this.ebookApi.ebookControllerGetBooks();
  }

  uploadEbooks(sendToKindle: boolean, sendToTori: boolean, files: Array<File>) {
    const formData = {}; 
    files.forEach((file) => {
      formData[file.name] = file;
    });
    return this.ebookApi.ebookControllerAddEbook({ sendToKindle, sendToTori, body: formData }).pipe(share());
  }

  deleteEbook(ebook: EbookData) {
    return this.ebookApi.ebookControllerDeleteEbook({ body: ebook });
  }

  sendToKindle(ebook: EbookData, sendToTori = false) {
    return this.ebookApi.ebookControllerSendBookToKindle({ body: ebook, sendToTori });
  }

  searchForBooks(query: string) {
    return this.ebookApi.ebookControllerSearchEbooks({ search: query});
  }

  downloadBook(book: LibgenData, sendToKindle: boolean, sendToTori: boolean) {
    return this.ebookApi.ebookControllerDownloadEbook({ sendToKindle, sendToTori, body: book });
  }
}
