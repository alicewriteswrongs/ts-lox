import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";

export class Environment {
  values: Map<string, any>;
  enclosing: Environment | null = null;

  constructor(parentEnv?: Environment) {
    if (parentEnv) {
      this.enclosing = parentEnv;
    }
    this.values = new Map();
  }

  define(name: string, value: any) {
    this.values.set(name, value);
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.define(name.lexeme, value);
    } else {
      if (this.enclosing !== null) {
        this.enclosing.assign(name, value);
        return;
      }
      throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
    }
  }
}
