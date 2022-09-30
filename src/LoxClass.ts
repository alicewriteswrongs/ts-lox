import { Environment } from "./Environment.ts";
import { LoxCallable, LoxFunction } from "./LoxCallable.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";
type Methods = Map<string, LoxFunction>;

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

export class LoxClass implements LoxCallable {
  name: string;
  methods: Methods;
  metaclass: LoxInstance;
  superclass: LoxClass | null;

  constructor(name: string, superclass: LoxClass | null, methods: Methods) {
    this.name = name;
    this.methods = methods;
    this.metaclass = new LoxInstance(this);
    this.superclass = superclass;
  }

  toString(): string {
    return `Class ${this.name}`;
  }

  /**
   * Get the constructor, which is just a method named 'init'
   */
  getInit(): LoxFunction | null {
    return this.findMethod("init");
  }

  call(environment: Environment, args: any[]): any {
    const instance = new LoxInstance(this);

    const constructor = this.getInit();

    if (constructor !== null) {
      constructor.bind(instance).call(environment, args);
    }

    return instance;
  }

  arity() {
    const constructor = this.getInit();

    if (constructor === null) {
      return 0;
    }
    return constructor.arity();
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name) ?? null;
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return null;
  }
}
