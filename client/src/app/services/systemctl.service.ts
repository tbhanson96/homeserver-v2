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

export type SystemctlUnitAction = 'start' | 'stop' | 'restart';

export interface SystemctlActionResult {
  unit: string;
  action: SystemctlUnitAction;
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

  public startUnit(unit: string): Observable<SystemctlActionResult> {
    return this.runUnitAction(unit, 'start');
  }

  public stopUnit(unit: string): Observable<SystemctlActionResult> {
    return this.runUnitAction(unit, 'stop');
  }

  public restartUnit(unit: string): Observable<SystemctlActionResult> {
    return this.runUnitAction(unit, 'restart');
  }

  private runUnitAction(unit: string, action: SystemctlUnitAction): Observable<SystemctlActionResult> {
    return this.http.post<SystemctlActionResult>('/api/systemctl/' + action, { unit });
  }
}
