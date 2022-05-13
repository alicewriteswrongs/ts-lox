import { Expr } from "./Expr.ts";

export interface ExpressionStmt {
  expression: Expr;
  nodeType: "ExpressionStmt";
}

/**
 * Factory function for creating a ExpressionStmt record
 *
 * Arguments:
 * @param expression Expr
 * @returns a ExpressionStmt node
 */
export function createExpressionStmt(
  expression: Expr,
): ExpressionStmt {
  const newExpressionStmt: ExpressionStmt = {
    expression,
    nodeType: "ExpressionStmt",
  };
  return newExpressionStmt;
}

export interface PrintStmt {
  expression: Expr;
  nodeType: "PrintStmt";
}

/**
 * Factory function for creating a PrintStmt record
 *
 * Arguments:
 * @param expression Expr
 * @returns a PrintStmt node
 */
export function createPrintStmt(
  expression: Expr,
): PrintStmt {
  const newPrintStmt: PrintStmt = {
    expression,
    nodeType: "PrintStmt",
  };
  return newPrintStmt;
}

export type Stmt =
  | ExpressionStmt
  | PrintStmt;

export function isStmt(ASTNode: Stmt | Expr): ASTNode is Stmt {
  return [
    "ExpressionStmt",
    "PrintStmt",
  ].includes(ASTNode.nodeType);
}
