import { Expr } from "./Expr.ts";

export interface Expression {
  expression: Expr;
  exprType: "Expression";
}

/**
 * Factory function for creating a Expression record
 *
 * Arguments:
 * @param expression Expr
 * @returns a Expression node
 */
export function createExpression(
  expression: Expr,
): Expression {
  const newExpression: Expression = {
    expression,
    exprType: "Expression",
  };
  return newExpression;
}

export interface Print {
  expression: Expr;
  exprType: "Print";
}

/**
 * Factory function for creating a Print record
 *
 * Arguments:
 * @param expression Expr
 * @returns a Print node
 */
export function createPrint(
  expression: Expr,
): Print {
  const newPrint: Print = {
    expression,
    exprType: "Print",
  };
  return newPrint;
}

export type Stmt =
  | Expression
  | Print;
