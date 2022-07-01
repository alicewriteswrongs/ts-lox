import { Environment } from "./Environment.ts";
import { NativeFunction } from "./LoxCallable.ts";

export class GlobalEnvironment extends Environment {
  constructor() {
    super();

    // implement a function to get the current time in milliseconds
    this.define(
      "clock",
      new NativeFunction(
        (_env: Environment) => {
          console.log( Date.now());
        }
      ),
    );
  }
}
