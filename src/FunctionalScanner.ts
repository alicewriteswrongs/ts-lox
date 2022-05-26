import { error } from "./Lox"
import { Token, TokenType } from "./Token"

/**
 * Chop a string into two fragments, splitting at the provided index
 */
function chopAt (str: string, index: number): [string, string] {
  return [str.slice(0, index), str.slice(2)]
}

function splitAtFirst (str: string, splitAt: string) {
  let index = str.indexOf(splitAt)
  if (index === -1) {
    // didn't find the string to split at
    return [str, ""]
  } else {
    return [str.slice(0, index), str.slice(index)]
  }
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9"
}

/**
 * Alternative, function-based scanner
 */
export const scan(source): Token[] {
  let tokens: Token[] = []

  let start = 0
  let current = 0
  let line = 1

  function scanner(
    sourceFragment: string,
  ) {
    if (sourceFragment === "") {
      tokens.push(new Token(TokenType.EOF, "", "", line))
    }

    let c = sourceFragment[0]

    switch (c) {
      case "(": 
        tokens.push(new Token(TokenType.LEFT_PAREN, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case ")": 
        tokens.push(new Token(TokenType.RIGHT_PAREN, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "{":
        tokens.push(new Token(TokenType.LEFT_BRACE, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "}":
        tokens.push(new Token(TokenType.RIGHT_BRACE, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case ",":
        tokens.push(new Token(TokenType.COMMA, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case ".":
        tokens.push(new Token(TokenType.DOT, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "-":
        tokens.push(new Token(TokenType.MINUS, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "+":
        tokens.push(new Token(TokenType.PLUS, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case ";":
        tokens.push(new Token(TokenType.SEMICOLON, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "*": 
        tokens.push(new Token(TokenType.STAR, c, "", line))
        scanner(sourceFragment.slice(1))
        break
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG)
        let matches = sourceFragment[1] === "="
        if (matches) {
          tokens.push(new Token(TokenType.BANG_EQUAL, sourceFragment.slice(0, 2), "", line))
          scanner(sourceFragment.slice(2))
        } else {
          tokens.push(new Token(TokenType.BANG, c, "", line))
          scanner(sourceFragment.slice(1))
        }
        break
      case "=": 
        let matches = sourceFragment[1] === "="
        if (matches) {
          tokens.push(new Token(TokenType.EQUAL_EQUAL, sourceFragment.slice(0, 2), "", line))
          scanner(sourceFragment.slice(2))
        } else {
          tokens.push(new Token(TokenType.EQUAL, c, "", line))
          scanner(sourceFragment.slice(1))
        }
        break
      case "<":
        let matches = sourceFragment[1] === "="
        if (matches) {
          tokens.push(new Token(TokenType.LESS_EQUAL, sourceFragment.slice(0, 2), "", line))
          scanner(sourceFragment.slice(2))
        } else {
          tokens.push(new Token(TokenType.LESS, c, "", line))
          scanner(sourceFragment.slice(1))
        }
        break
      case ">": {
        let matches = sourceFragment[1] === "="
        if (matches) {
          tokens.push(new Token(TokenType.GREATER_EQUAL, sourceFragment.slice(0, 2), "", line))
          scanner(sourceFragment.slice(2))
        } else {
          tokens.push(new Token(TokenType.GREATER, c, "", line))
          scanner(sourceFragment.slice(1))
        }
        break
      }
      case "/": {
        if (sourceFragment[1] === "/") {
          // we've hit a comment! we want to gobble up to the end of the line
          let [,remainder] = splitAtFirst(sourceFragment.slice(2), '\n')
          scanner(remainder)
        } else {
          tokens.push(new Token(TokenType.SLASH, c, "", line))
        }
        break
      }
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        scanner(sourceFragment.slice(1))
        break
      case "\n":
        line++
        scanner(sourceFragment.slice(1))
        break
      case '"': this.string(); break;
      case '"':
        // string literal
        let [contents, remainder] = splitAtFirst(
          sourceFragment.slice(1), 
          '"'
        )
        if (remainder === "") {
          error(line, "Unterminated string.");
        } else {
          line += contents.match(/\n/g)?.length ?? 0
          tokens.push(new Token(
            TokenType.STRING,
            contents,
            `"${contents}"`,
            line
          ))
        }
        scanner(remainder.slice(1))
        break
      default: {
        if (isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
        error(line, `Unexpected character: ${c}`)
        }
      }
    }

  }

  return tokens
}
