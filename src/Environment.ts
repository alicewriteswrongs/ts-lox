import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";

export class Environment {
  values: Map<string, any>;

  constructor() {
    this.values = new Map();
  }

  define(name: string, value: any) {
    this.values.set(name, value);
  }

  get(name: Token) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.define(name.lexeme, value);
    } else {
      throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
    }
  }
}
