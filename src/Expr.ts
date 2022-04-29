import { Token } from "./Token.ts";
import { LiteralValue } from "./Literal.ts";

export interface Binary {
  left: Expr;
  operator: Token;
  right: Expr;
  exprType: "Binary";
}

/**
 * Factory function for creating a Binary record
 *
 * Arguments:
 * @param left Expr
 * @param operator Token
 * @param right Expr
 * @returns a Binary node
 */
export function createBinary(
  left: Expr,
  operator: Token,
  right: Expr,
): Binary {
  const newBinary: Binary = {
    left,
    operator,
    right,
    exprType: "Binary",
  };
  return newBinary;
}

export interface Grouping {
  expression: Expr;
  exprType: "Grouping";
}

/**
 * Factory function for creating a Grouping record
 *
 * Arguments:
 * @param expression Expr
 * @returns a Grouping node
 */
export function createGrouping(
  expression: Expr,
): Grouping {
  const newGrouping: Grouping = {
    expression,
    exprType: "Grouping",
  };
  return newGrouping;
}

export interface Literal {
  value: LiteralValue;
  exprType: "Literal";
}

/**
 * Factory function for creating a Literal record
 *
 * Arguments:
 * @param value LiteralValue
 * @returns a Literal node
 */
export function createLiteral(
  value: LiteralValue,
): Literal {
  const newLiteral: Literal = {
    value,
    exprType: "Literal",
  };
  return newLiteral;
}

export interface Unary {
  operator: Token;
  right: Expr;
  exprType: "Unary";
}

/**
 * Factory function for creating a Unary record
 *
 * Arguments:
 * @param operator Token
 * @param right Expr
 * @returns a Unary node
 */
export function createUnary(
  operator: Token,
  right: Expr,
): Unary {
  const newUnary: Unary = {
    operator,
    right,
    exprType: "Unary",
  };
  return newUnary;
}

export type Expr =
  | Binary
  | Grouping
  | Literal
  | Unary;
