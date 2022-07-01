import { Environment } from "./Environment.ts";
import { Expr } from "./Expr.ts";
import { interpretBlockStmt } from "./Interpreter.ts";
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
    // we pass environment to the native function impl
    // but the lox interpreter only needs to be concerned
    // with the length of the 'lox args'
    return this.fn.length - 1;
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

  call(environment: Environment, args: any[]) {
    // create a new environment for this function
    const functionScope = new Environment(environment);

    for (let i = 0; i < this.declaration.params.length; i++) {
      functionScope.define(
        this.declaration.params[i].lexeme,
        args[i],
      );
    }

    interpretBlockStmt(this.declaration.body, functionScope);
    return null;
  }

  arity() {
    return this.declaration.params.length
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme}>`
  }
}

export function isLoxCallable(maybeCallable: any): maybeCallable is LoxCallable {
  if (maybeCallable instanceof LoxFunction) {
    return true
  }
  if (maybeCallable instanceof NativeFunction) {
    return true
  }
  return false
}
