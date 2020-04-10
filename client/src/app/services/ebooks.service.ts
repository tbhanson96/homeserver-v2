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
}
