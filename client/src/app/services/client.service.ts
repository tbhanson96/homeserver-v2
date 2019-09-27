import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ClientService {


  constructor(private httpClient: HttpClient) { }

  public get<T>(url: string): Observable<T> {
    return Observable.create(observer => {
      this.httpClient.get<T>(url).subscribe(data => {

      });
    });
  }
}


export const Routes = {
  api: "/api",
  files: "/api/files",
}
