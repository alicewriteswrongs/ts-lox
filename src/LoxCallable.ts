import { Environment } from "./Environment.ts";
import { Expr } from "./Expr.ts";

interface LoxCallable {
  call: (environment: Environment, args: any[]) => void,
    arity: () => number;

}

export const isLoxCallable = (obj: any): obj is LoxCallable => {
  return true
  // TODO implement
}

type NativeFunctionImpl<ReturnType> = (env: Environment, ...rest: Expr[]) => ReturnType;

export class NativeFunction<ReturnType> implements LoxCallable {
  fn: NativeFunctionImpl<ReturnType>;
  constructor(nativeFunction: NativeFunctionImpl<ReturnType>) {
    this.fn = nativeFunction
  }

  call(environment: Environment, args: any[]) {
    this.fn(environment, ...args);
  }

  arity() {
    return this.fn.length
  }

  toString () {
    return "<native fn>"
  }
}

// export class  {
//   constructor() {
//   }

//   call(environment: Environment, args: Object[]) {
//   }

//   arity() {
//   }
// }
