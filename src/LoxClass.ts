import { Environment } from "./Environment.ts";
import { LoxCallable } from "./LoxCallable.ts";

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

class LoxInstance {
  klass: LoxClass;

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
