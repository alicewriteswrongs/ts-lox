import { Expr } from "./Expr.ts";

export function printAST(expr: Expr) {
  switch (expr.exprType) {
    case "Ternary":
      return parenthesize("Ternary", expr.condition, expr.whenTrue, expr.whenFalse)
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
