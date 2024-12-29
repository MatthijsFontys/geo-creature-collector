import { HasResponse } from "./mediator-middleware";

export interface IdQuery<T> extends HasResponse<T> {
  id: string;
}

export interface NumIdQuery<T> extends HasResponse<T> {
  id: number;
}
