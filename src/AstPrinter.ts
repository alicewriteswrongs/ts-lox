import { Expr } from "./Expr.ts";
import { Stmt } from "./Stmt.ts";

export function printAST(expr: Expr | Stmt | null) {
  if (expr === null) {
    return "null";
  }

  switch (expr.nodeType) {
    case "Ternary":
      return parenthesize(
        "Ternary",
        expr.condition,
        expr.whenTrue,
        expr.whenFalse,
      );
    case "Binary":
      return parenthesize(expr.operator.lexeme, expr.left, expr.right);
    case "Grouping":
      return parenthesize("group", expr.expression);
    case "Literal":
      if (expr.value == null) {
        return "nil";
      }
      return expr.value.toString();
    case "Unary":
      return parenthesize(expr.operator.lexeme, expr.right);
  }
}

function parenthesize(name: string, ...exprs: Expr[]): string {
  let out = `(${name}`;
  exprs.forEach((expr) => {
    out += " ";
    out += printAST(expr);
  });
  out += ")";
  return out;
}
