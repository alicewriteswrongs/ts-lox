import { Environment } from "./Environment.ts";
import { Expr, FunctionExpr } from "./Expr.ts";
import { interpretBlockStmt } from "./Interpreter.ts";
import { LoxClass, LoxInstance } from "./LoxClass.ts";
import { Return } from "./Return.ts";
import { Token } from "./Token.ts";

export interface LoxCallable {
  call: (environment: Environment, args: any[]) => null;
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

  call(environment: Environment, args: any[]): any {
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
  name?: Token;
  declaration: FunctionExpr;
  closure: Environment;
  isInitializer: boolean;

  constructor(
    declaration: FunctionExpr,
    closure: Environment,
    isInitializer: boolean,
    name?: Token,
  ) {
    if (name) {
      this.name = name;
    }
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  call(_environment: Environment, args: any[]) {
    // create a new environment for this function
    const functionScope = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      functionScope.define(
        this.declaration.params[i].lexeme,
        args[i],
      );
    }

    try {
      interpretBlockStmt(this.declaration.body, functionScope);
    } catch (err) {
      if (err instanceof Return) {
        // there was a return in the function, so we should grab the value and return it
        return err.value;
      } else {
        // something else happened, rethrow
        throw err;
      }
    }

    if (this.isInitializer) {
      return this.closure._get("this");
    }

    return null;
  }

  arity() {
    return this.declaration.params.length;
  }

  toString() {
    return `<fn ${this.name}>`;
  }

  bind(instance: LoxInstance) {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(
      this.declaration,
      environment,
      this.isInitializer,
      this.name,
    );
  }
}

export function isLoxCallable(
  maybeCallable: any,
): maybeCallable is LoxCallable {
  if (maybeCallable instanceof LoxFunction) {
    return true;
  }
  if (maybeCallable instanceof NativeFunction) {
    return true;
  }
  if (maybeCallable instanceof LoxClass) {
    return true;
  }
  return false;
}
