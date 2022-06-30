import { Environment } from "./Environment.ts";
import { Expr } from "./Expr.ts";
import { FunctionStmt } from "./Stmt.ts";

interface LoxCallable {
  call: (environment: Environment, args: any[]) => void;
  arity: () => number;
}

type NativeFunctionImpl<ReturnType> = (
  env: Environment,
  ...rest: Expr[]
) => ReturnType;

export class NativeFunction<ReturnType> implements LoxCallable {
  fn: NativeFunctionImpl<ReturnType>;
  constructor(nativeFunction: NativeFunctionImpl<ReturnType>) {
    this.fn = nativeFunction;
  }

  call(environment: Environment, args: any[]) {
    this.fn(environment, ...args);
  }

  arity() {
    return this.fn.length;
  }

  toString() {
    return "<native fn>";
  }
}

export class LoxFunction implements LoxCallable {
  declaration: FunctionStmt;

  constructor(declaration: FunctionStmt) {
    this.declaration = declaration;
  }

  // @ts-ignore
  call(environment: Environment, args: any[], execute: any) {
    // create a new environment for this function
    const functionScope = new Environment(environment);

    for (let i = 0; i < this.declaration.params.length; i++) {
      functionScope.define(
        this.declaration.params[i].lexeme,
        args[i],
      );
    }

    execute(this.declaration.body, environment);
    return null;
  }
}
