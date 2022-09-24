import { Environment } from "./Environment.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";

export class LoxClass implements LoxCallable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  toString(): string {
    return `Class ${this.name}`;
  }

  call(environment: Environment, args: any[]) {
    return new LoxInstance(this);
  }

  arity() {
    return 0;
  }
}

export class LoxInstance {
  klass: LoxClass;
  fields = new Map();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    throw new RuntimeError(
      name,
      `Undefined property ${name.lexeme}`,
    );
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
