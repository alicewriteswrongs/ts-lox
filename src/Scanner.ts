import {Token, TokenType} from "./TokenType"

class Scanner {
  source: string = ""
  tokens: Token[] = []

  // private fields
  #start: number = 0
  #current: number = 0
  #line: number = 1

  constructor(source: string) {
    this.source = source
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.#start = this.#current
      this.scanToken()
    }

    this.tokens.push(new Token(
      TokenType.EOF,
      "",
      {},
      this.#line
    ))
    return this.tokens
  }

  isAtEnd(): boolean {
    return this.#current >= this.source.length()
  }

  addToken(type: TokenType, literal?: Object) {
    let text = this.source.slice(
      this.#start,
      this.#current
    )
    this.tokens.push(new Token(
      type,
      text,
      literal,
      this.#line
    ))
  }

  advance(): string {
    return this.source.charAt(this.#current++)
  }

  scanToken() {
    let c = this.advance()

    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break; 
    }
  }
}

let scanner = new Scanner("foo")
scanner

