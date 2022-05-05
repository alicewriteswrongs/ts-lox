import { LiteralValue } from "./Literal.ts";

export class Token {
  type: TokenType;
  lexeme: string;
  /**
   * The literal value for this token - handy if it's a string or something!
   */
  literal: LiteralValue;
  line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: LiteralValue,
    line: number,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

/**
 * Every token in the universe!
 */
export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN = "LeftParen",
  RIGHT_PAREN = "RightParen",
  LEFT_BRACE = "LeftBrace",
  RIGHT_BRACE = "RightBrace",
  COMMA = "Comma",
  DOT = "Dot",
  MINUS = "Minus",
  PLUS = "Plus",
  SEMICOLON = "Semicolon",
  SLASH = "Slash",
  STAR = "Star",
  QUESTION_MARK = "QuestionMark",
  COLON = "Colon",

  // One or two character tokens.
  BANG = "Bang",
  BANG_EQUAL = "BangEqual",
  EQUAL = "Equal",
  EQUAL_EQUAL = "EqualEqual",
  GREATER = "Greater",
  GREATER_EQUAL = "GreaterEqual",
  LESS = "Less",
  LESS_EQUAL = "LessEqual",

  // Literals.
  IDENTIFIER = "Identifier",
  STRING = "String",
  NUMBER = "Number",

  // Keywords.
  AND = "Keyword: And",
  CLASS = "Keyword: Class",
  ELSE = "Keyword: Else",
  FALSE = "Keyword: False",
  FUN = "Keyword: Fun",
  FOR = "Keyword: For",
  IF = "Keyword: If",
  NIL = "Keyword: Nil",
  OR = "Keyword: Or",
  PRINT = "Keyword: Print",
  RETURN = "Keyword: Return",
  SUPER = "Keyword: Super",
  THIS = "Keyword: This",
  TRUE = "Keyword: True",
  VAR = "Keyword: Var",
  WHILE = "Keyword: While",

  EOF = "EOF",
}
