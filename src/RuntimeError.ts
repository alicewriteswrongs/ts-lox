import { Token } from "./Token.ts";

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super();
    this.token = token;
    this.message = message;
  }
}
