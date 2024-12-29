import { Context } from "hono";
import { AppEnvWeak } from "../app-environment";

// TODO: add good documentation about why this is necessary in rare cases

type WeakEnvParameters<T extends (...args: any[]) => void | Promise<void>> =
  Parameters<T> extends [any, ...infer R] ? [Context<AppEnvWeak>, ...R] : never;

type WeakEnvFn<T extends (...args: any[]) => void | Promise<void>> = (
  ...p: WeakEnvParameters<T>
) => void | Promise<void>;

export function toWeakEnv<T extends (...args: any[]) => void | Promise<void>>(
  fn: T
): WeakEnvFn<T> {
  return fn as WeakEnvFn<T>;
}
