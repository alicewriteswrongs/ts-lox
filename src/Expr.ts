import { Token } from "./Token.ts";
import { LiteralValue } from "./Literal.ts";

export interface Binary {
  left: Expr;
  operator: Token;
  right: Expr;
}

/**
 * Factory function for creating a Binary record
 *
 * Arguments:
 * left: Expr
 * operator: Token
 * right: Expr
 */
export function createBinary(
  left: Expr,
  operator: Token,
  right: Expr,
): Binary {
  const newBinary = {
    left,
    operator,
    right,
  };
  return newBinary;
}

export interface Grouping {
  expression: Expr;
}

/**
 * Factory function for creating a Grouping record
 *
 * Arguments:
 * expression: Expr
 */
export function createGrouping(
  expression: Expr,
): Grouping {
  const newGrouping = {
    expression,
  };
  return newGrouping;
}

export interface Literal {
  value: LiteralValue;
}

/**
 * Factory function for creating a Literal record
 *
 * Arguments:
 * value: LiteralValue
 */
export function createLiteral(
  value: LiteralValue,
): Literal {
  const newLiteral = {
    value,
  };
  return newLiteral;
}

export interface Unary {
  operator: Token;
  right: Expr;
}

/**
 * Factory function for creating a Unary record
 *
 * Arguments:
 * operator: Token
 * right: Expr
 */
export function createUnary(
  operator: Token,
  right: Expr,
): Unary {
  const newUnary = {
    operator,
    right,
  };
  return newUnary;
}

type Expr =
  | Binary
  | Grouping
  | Literal
  | Unary;
