export abstract class Empty {
  static get LAMBDA(): () => void {
    return () => {};
  }

  static get VOID() {
    return undefined as void;
  }

  static get OBJECT() {
    return {};
  }
}

export type EmptyLambda = () => void;
export interface EmptyObject {}
