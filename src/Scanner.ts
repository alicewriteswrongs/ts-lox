import { LiteralValue } from "./Literal"
import { Token, TokenType } from "./Token"
import { ErrorFunc } from "./types/error"

const KEYWORDS: Record<string, TokenType> = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
}

export class Scanner {
  source = ""
  tokens: Token[] = []
  error: ErrorFunc

  // private fields
  #start = 0
  #current = 0
  #line = 1

  constructor(source: string, error: ErrorFunc) {
    this.source = source
    this.error = error
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

  addToken(type: TokenType, literal?: LiteralValue) {
    const text = this.source.slice(this.#start, this.#current)
    this.tokens.push(new Token(type, text, literal ?? "", this.#line))
  }

  advance(): string {
    return this.source.charAt(this.#current++)
  }

  scanToken() {
    const c = this.advance()

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
        } else if (this.match("*")) {
          while (
            this.peek() !== "*" &&
            this.peekNext() !== "/" &&
            !this.isAtEnd()
          ) {
            // gobble up the comment
            if (this.peek() == "\n") {
              this.#line++
            }
            this.advance()
          }

          if (this.isAtEnd()) {
            // unterminated multi-line comment
            this.error(this.#line, "Unterminated block comment")
          }
          // advance through '*' and '/'
          this.advance()
          this.advance()
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
      case '"':
        this.string()
        break
      default: {
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
          this.error(this.#line, `Unexpected character: ${c}`)
        }
      }
    }
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance()
    }

    const text = this.source.substring(this.#start, this.#current)

    this.addToken(KEYWORDS[text] ?? TokenType.IDENTIFIER)
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance()
    }

    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      this.advance()
      while (this.isDigit(this.peek())) {
        this.advance()
      }
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.slice(this.#start, this.#current))
    )
  }

  /**
   * Produce a token for a string literal
   */
  string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        this.#line++
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      this.error(this.#line, "Unterminated string.")
      return
    }

    // The closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value = this.source.slice(this.#start + 1, this.#current - 1)
    this.addToken(TokenType.STRING, value)
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

  peekNext(): string {
    if (this.#current + 1 >= this.source.length) {
      return "\0"
    }
    return this.source.charAt(this.#current + 1)
  }

  isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_"
  }

  isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c)
  }

  isDigit(c: string) {
    return c >= "0" && c <= "9"
  }
}
