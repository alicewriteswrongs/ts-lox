import {
  createBinary,
  createGrouping,
  createLiteral,
  createUnary,
  Expr,
} from "./Expr.ts";
import { TokenType } from "./Token.ts";
import { Token } from "./Token.ts";

export function printAST(expr: Expr) {
  switch (expr.exprType) {
    case "Binary": {
      return parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }
    case "Grouping":
      return parenthesize("group", expr.expression);
    case "Literal":
      if (expr.value == null) {
        return "nil";
      }
      return expr.value.toString();
    case "Unary":
      return parenthesize(
        expr.operator.lexeme,
        expr.right,
      );
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

function main() {
  const expr = createBinary(
    createUnary(
      new Token(TokenType.MINUS, "-", null, 1),
      createLiteral(123),
    ),
    new Token(TokenType.STAR, "*", null, 1),
    createGrouping(
      createLiteral(45.67),
    ),
  );
  const ast = printAST(expr);
  console.log(ast);
}

main();
