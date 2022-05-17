import { Token } from "./Token.ts";
import { LiteralValue } from "./Literal.ts";

export interface Assign {
  name: Token;
  value: Expr;
  nodeType: "Assign";
}

/**
 * Factory function for creating a Assign record
 *
 * Arguments:
 * @param name Token
 * @param value Expr
 * @returns a Assign node
 */
export function createAssign(
  name: Token,
  value: Expr,
): Assign {
  const newAssign: Assign = {
    name,
    value,
    nodeType: "Assign",
  };
  return newAssign;
}

export interface Ternary {
  condition: Expr;
  token: Token;
  whenTrue: Expr;
  whenFalse: Expr;
  nodeType: "Ternary";
}

/**
 * Factory function for creating a Ternary record
 *
 * Arguments:
 * @param condition Expr
 * @param token Token
 * @param whenTrue Expr
 * @param whenFalse Expr
 * @returns a Ternary node
 */
export function createTernary(
  condition: Expr,
  token: Token,
  whenTrue: Expr,
  whenFalse: Expr,
): Ternary {
  const newTernary: Ternary = {
    condition,
    token,
    whenTrue,
    whenFalse,
    nodeType: "Ternary",
  };
  return newTernary;
}

export interface Binary {
  left: Expr;
  operator: Token;
  right: Expr;
  nodeType: "Binary";
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
    nodeType: "Binary",
  };
  return newBinary;
}

export interface Grouping {
  expression: Expr;
  nodeType: "Grouping";
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
    nodeType: "Grouping",
  };
  return newGrouping;
}

export interface Literal {
  value: LiteralValue;
  nodeType: "Literal";
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
    nodeType: "Literal",
  };
  return newLiteral;
}

export interface Unary {
  operator: Token;
  right: Expr;
  nodeType: "Unary";
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
    nodeType: "Unary",
  };
  return newUnary;
}

export interface Variable {
  name: Token;
  nodeType: "Variable";
}

/**
 * Factory function for creating a Variable record
 *
 * Arguments:
 * @param name Token
 * @returns a Variable node
 */
export function createVariable(
  name: Token,
): Variable {
  const newVariable: Variable = {
    name,
    nodeType: "Variable",
  };
  return newVariable;
}

export type Expr =
  | Assign
  | Ternary
  | Binary
  | Grouping
  | Literal
  | Unary
  | Variable;

export function isExpr(ASTNode: Stmt | Expr): ASTNode is Expr {
  return [
    "Assign",
    "Ternary",
    "Binary",
    "Grouping",
    "Literal",
    "Unary",
    "Variable",
  ].includes(ASTNode.nodeType);
}
