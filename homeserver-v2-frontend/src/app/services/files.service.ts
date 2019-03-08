import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  private currentDirectory: BehaviorSubject<string>;
  constructor() {
    this.currentDirectory = new BehaviorSubject<string>('');
  }

  public setCurrentDirectory(directory: string): void {
       this.currentDirectory.next(directory);
  }

  public getCurrentDirectory(): Observable<string> {
        return this.currentDirectory.asObservable();
  }

}
