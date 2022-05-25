import {
  createAssign,
  createBinary,
  createGrouping,
  createLiteral,
  createTernary,
  createUnary,
  createVariable,
  Expr,
} from "./Expr.ts";
import {
  createBlockStmt,
  createExpressionStmt,
  createIfStmt,
  createPrintStmt,
  createVarStmt,
} from "./Stmt.ts";
import { Stmt } from "./Stmt.ts";
import { BINARY_OPERATORS, Token, TokenType } from "./Token.ts";
import { ErrorFunc } from "./types/error.ts";

/**
 * This Parser is where the grammar for Lox is really implemented. We
 * are implementing a recursive descent parser here.
 */
export default class Parser {
  #tokens: Token[];
  #current = 0;
  /**
   * Our error reporter function, passed in from the calling
   * context.
   */
  error: ErrorFunc;

  constructor(tokens: Token[], error: ErrorFunc) {
    this.#tokens = tokens;
    this.error = error;
  }

  /**
   * Check that the current token is of a given TokenType. If it is, consume it
   * so we can move on.
   */
  match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Check that the current token is of type `type` _without_
   * advancing to the next one.
   */
  check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }

  /**
   * Are we at the end of the current file?
   */
  isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Grab the current token
   */
  peek(): Token {
    return this.#tokens[this.#current];
  }

  /**
   * Grab the previous token
   */
  previous(): Token {
    return this.#tokens[this.#current - 1];
  }

  consume(type: TokenType, message: string) {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.parserError(this.peek(), message);
  }

  /**
   * Report an error to the outside context (`this.error`).
   * We also create an error that we can throw if we want to.
   */
  parserError(token: Token, message: string) {
    this.error(token.line, message);
    const error = new ParserError();
    return error;
  }

  /**
   * Return the current token and iterate the pointer
   */
  advance(): Token {
    if (!this.isAtEnd()) {
      this.#current++;
    }
    return this.previous();
  }

  /**
   * For doing a bit of error recovery.
   */
  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return;
      }

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  parse(): Stmt[] | null {
    try {
      const statements: Stmt[] = [];
      while (!this.isAtEnd()) {
        const declaration = this.declaration();
        if (declaration) {
          statements.push(declaration);
        }
      }
      return statements;
    } catch (_err) {
      return null;
    }
  }

  // GRAMMAR RULES
  //
  // below here are the methods which implement the grammar for our
  // language. Neat stuff!
  //
  // program        → declaration* EOF ;
  // declaration    → varDecl
  //                | statement ;
  // varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
  // statement      → exprStmt
  //                | ifStmt
  //                | printStmt
  //                | block ;
  // exprStmt       → expression ";" ;
  // ifStmt         → "if" "(" expression ")" statement ( "else" statement )? ;
  // printStmt      → "print" expression ";" ;
  // block          → "{" declaration "}" ;
  // expression     → assignment ("," assignment)* ;
  // assignment     → IDENTIFIER "=" assignment
  //                | ternary ;
  // ternary        → equality ("?" expression ":" ternary)?
  // equality       → comparison ( ( "!=" | "==" ) comparison )* ;
  // comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  // term           → factor ( ( "-" | "+" ) factor )* ;
  // factor         → unary ( ( "/" | "*" ) unary )* ;
  // unary          → ( "!" | "-" ) unary
  //                | primary ;
  // primary        → NUMBER | STRING | "true" | "false" | "nil"
  //                | "(" expression ")"
  //                | IDENTIFIER ;

  /**
   * declaration    → varDecl
   *                | statement ;
   */
  declaration() {
    try {
      if (this.match(TokenType.VAR)) {
        return this.varDeclaration();
      }
      return this.statement();
    } catch (_err) {
      this.synchronize();
    }
  }

  /**
   * statement → exprStmt
   *           | printStmt
   *           | block ;
   */
  statement(): Stmt {
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return createBlockStmt(this.block());
    }
    return this.expressionStatement();
  }

  /**
   * varDecl → "var" IDENTIFIER ( "=" expression )? ";" ;
   */
  varDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer = undefined;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return createVarStmt(name, initializer);
  }

  /**
   * ifStmt → "if" "(" expression ")" statement ( "else" statement )? ;
   */
  ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");

    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'if'.");

    const thenBranch = this.statement();
    let elseBranch;

    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }
    return createIfStmt(condition, thenBranch, elseBranch);
  }

  /**
   * printStmt → "print" expression ";" ;
   */
  printStatement(): Stmt {
    const expr = this.expression();

    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return createPrintStmt(expr);
  }

  /**
   * exprStmt → expression ";" ;
   */
  expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return createExpressionStmt(expr);
  }

  /**
   * block → "{" declaration "}" ;
   */
  block(): Stmt[] {
    const statements = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) {
        statements.push(declaration);
      }
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  /**
   *  expression → assignment ("," assignment )* ;
   */
  expression(): Expr {
    if (BINARY_OPERATORS.includes(this.peek().type)) {
      this.parserError(
        this.peek(),
        "looks like we've got a binary operator out front",
      );
    }

    let expr = this.assignment();

    while (
      this.match(
        TokenType.COMMA,
      )
    ) {
      const operator = this.previous();
      const right = this.assignment();
      expr = createBinary(expr, operator, right);
    }
    return expr;
  }

  /** assignment     → IDENTIFIER "=" assignment
   *                 | ternary ;
   */
  assignment(): Expr {
    const expr = this.ternary();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr.nodeType === "Variable") {
        const name = expr.name;
        return createAssign(
          name,
          value,
        );
      }
      this.parserError(equals, "Invalid assignment target.");
    }
    return expr;
  }

  /**
   * ternary → equality ("?" expression ":" ternary)?
   */
  ternary(): Expr {
    let expr = this.equality();

    while (
      this.match(TokenType.QUESTION_MARK)
    ) {
      const whenTrue = this.ternary();

      const colon = this.consume(
        TokenType.COLON,
        "? should be paired with a : for a ternary",
      );
      const whenFalse = this.ternary();
      expr = createTernary(
        expr,
        colon,
        whenTrue,
        whenFalse,
      );
    }

    return expr;
  }

  /**
   * equality → comparison ( ( "!=" | "==" ) comparison )* ;
   */
  equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = createBinary(expr, operator, right);
    }

    return expr;
  }

  /**
   * comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
   */
  comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = createBinary(expr, operator, right);
    }
    return expr;
  }

  /**
   * term → factor ( ( "-" | "+" ) factor )* ;
   */
  term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = createBinary(expr, operator, right);
    }
    return expr;
  }

  /**
   * factor → unary ( ( "/" | "*" ) unary )* ;
   */
  factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = createBinary(expr, operator, right);
    }
    return expr;
  }

  /**
   * unary → ( "!" | "-" ) unary
   *       | primary ;
   */
  unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return createUnary(operator, right);
    }
    return this.primary();
  }

  /**
   * primary → NUMBER | STRING | "true" | "false" | "nil"
   *         | "(" expression ")" ;
   */
  primary(): Expr {
    if (this.match(TokenType.FALSE)) {
      return createLiteral(false);
    }

    if (this.match(TokenType.TRUE)) {
      return createLiteral(true);
    }

    if (this.match(TokenType.NIL)) {
      return createLiteral(null);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return createLiteral(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return createVariable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return createGrouping(expr);
    }
    throw this.parserError(this.peek(), "Expect expression.");
  }
}

export class ParserError extends Error {}
