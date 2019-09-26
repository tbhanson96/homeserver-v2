import { Action } from '@ngrx/store';

export interface IAction extends Action {
    type: string;
    payload?: any;
}