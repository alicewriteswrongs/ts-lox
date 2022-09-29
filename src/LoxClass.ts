import { Environment } from "./Environment.ts";
import { LoxCallable, LoxFunction } from "./LoxCallable.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";
type Methods = Map<string, LoxFunction>;

export class LoxClass implements LoxCallable {
  name: string;
  methods: Methods;

  constructor(name: string, methods: Methods) {
    this.name = name;
    this.methods = methods;
  }

  toString(): string {
    return `Class ${this.name}`;
  }

  call(environment: Environment, args: any[]): any {
    return new LoxInstance(this);
  }

  arity() {
    return 0;
  }

  findMethod(name: string): LoxFunction | null {
    return this.methods.get(name) ?? null;
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

    const method = this.klass.findMethod(name.lexeme);
    if (method !== null) {
      return method.bind(this);
    }

    throw new RuntimeError(
      name,
      `Undefined property ${name.lexeme}`,
    );
  }

  set(name: Token, value: any) {
    this.fields.set(name.lexeme, value);
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
