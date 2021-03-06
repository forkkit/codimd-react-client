import { Action } from 'redux'

export enum ApiUrlActionType {
  SET_API_URL = 'api-url/set'
}

export interface ApiUrlActions extends Action<ApiUrlActionType> {
  type: ApiUrlActionType;
}

export interface SetApiUrlAction extends ApiUrlActions {
  state: ApiUrlObject;
}

export interface ApiUrlObject {
  apiUrl: string
}
