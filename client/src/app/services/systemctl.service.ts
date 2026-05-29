import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SystemctlUnit {
  name: string;
  load: string;
  active: string;
  sub: string;
  description: string;
}

export interface SystemctlActionResult {
  unit: string;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class SystemctlService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  public listUnits(): Observable<SystemctlUnit[]> {
    return this.http.get<SystemctlUnit[]>('/api/systemctl');
  }

  public restartUnit(unit: string): Observable<SystemctlActionResult> {
    return this.http.post<SystemctlActionResult>('/api/systemctl/restart', { unit });
  }
}
