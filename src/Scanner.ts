import { error } from "./Lox"
import { Token, TokenType } from "./Token"

export class Scanner {
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

    this.tokens.push(new Token(TokenType.EOF, "", "", this.#line))
    return this.tokens
  }

  isAtEnd(): boolean {
    return this.#current >= this.source.length
  }

  addToken(type: TokenType, literal?: string) {
    let text = this.source.slice(this.#start, this.#current)
    this.tokens.push(new Token(type, text, literal ?? "", this.#line))
  }

  advance(): string {
    return this.source.charAt(this.#current++)
  }

  scanToken() {
    let c = this.advance()

    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN)
        break
      case ")":
        this.addToken(TokenType.RIGHT_PAREN)
        break
      case "{":
        this.addToken(TokenType.LEFT_BRACE)
        break
      case "}":
        this.addToken(TokenType.RIGHT_BRACE)
        break
      case ",":
        this.addToken(TokenType.COMMA)
        break
      case ".":
        this.addToken(TokenType.DOT)
        break
      case "-":
        this.addToken(TokenType.MINUS)
        break
      case "+":
        this.addToken(TokenType.PLUS)
        break
      case ";":
        this.addToken(TokenType.SEMICOLON)
        break
      case "*":
        this.addToken(TokenType.STAR)
        break
      case "!": {
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG)
        break
      }
      case "=": {
        this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
        break
      }
      case "<": {
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS)
        break
      }
      case ">": {
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        )
        break
      }
      case "/": {
        if (this.match("/")) {
          while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance()
          }
        } else {
          this.addToken(TokenType.SLASH)
        }
        break
      }
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break
      case "\n":
        this.#line++
        break
      default: {
        error(this.#line, `Unexpected character: ${c}`)
      }
    }
  }

  /**
   * Match is like a conditional advance we can use to check for
   * a lexeme which is more than one character
   */
  match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false
    }
    if (this.source.charAt(this.#current) != expected) {
      // our two-character thingy hasn't matched!
      return false
    }
    // we matched, so increment current and return true
    this.#current++
    return true
  }

  /**
   * Just look one spot ahead!
   */
  peek(): string {
    if (this.isAtEnd()) {
      return "\0"
    }
    return this.source.charAt(this.#current)
  }
}

let scanner = new Scanner("foo")
scanner
