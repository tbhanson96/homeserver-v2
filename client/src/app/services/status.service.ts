import { Injectable } from '@angular/core';
import { StatusChannel, StatusUpdate } from '@api/models';
import { ApiService } from '@api/services';
import { filter, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private eventSource: EventSource;
  private subject = new Subject<StatusUpdate>();
  constructor(
  ) { 
    this.eventSource = new EventSource('/api/status');
    this.eventSource.onmessage = ({ data }) => {
      this.subject.next(JSON.parse(data));
    };
  }

  public getChannelStatus(channel: StatusChannel): Observable<StatusUpdate> {
    return this.subject.asObservable().pipe(filter(e => e.channel === channel), tap(x => console.log(JSON.stringify(x))));
  }

}
