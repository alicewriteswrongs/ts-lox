import { Expr } from "./Expr.ts";
import { Stmt } from "./Stmt.ts";
import { assertUnreachable } from "./util.ts";

type AST = Stmt[];

export function printAST(ast: AST, nesting = "") {
  const lines = ast.map(astNode => {
    return printStatementNode(astNode, nesting)
  })

  return lines.join("\n")
}

function printStatementNode(stmt: Stmt, nesting = ""): string {
  const lines: string[] = [];

  switch (stmt.nodeType) {
    case "IfStmt": {
      const { condition, thenBranch, elseBranch } = stmt

      lines.push("IfStatement");
      lines.push("  Condition:")
      lines.push(printExpressionNode(condition, "    "))
      lines.push("  ThenBranch");
      lines.push(printStatementNode(thenBranch, "    "));

      if (elseBranch) {
        lines.push(printStatementNode(thenBranch));
      }
      break;
    }
    case "BlockStmt": {
      const { statements }  = stmt;

      lines.push("BlockStatement")
      lines.push(printAST(statements, nesting + "  "))
      break
    }
    case "ExpressionStmt":
    case "PrintStmt": {
      const { expression }  = stmt

      lines.push(stmt.nodeType.replace("Stmt", "Statement"));
      lines.push(printExpressionNode(expression, "  "))
      break;
    }
    case "VarStmt": {
      const { initializer, name } = stmt;

      lines.push(`VarStatement ${name.lexeme}`)
      if (initializer) {
        lines.push(printExpressionNode(initializer, nesting + "  "))
      }
      break
    }
    default:
      assertUnreachable(stmt)
  }

  return lines.map(line => `${nesting}${line}`).join("\n")
}

function printExpressionNode(expr: Expr, nesting = ""): string {
  switch (expr.nodeType) {
    case "Assign":
      return nesting + "AssignmentExpression";
    case "Variable":
      return nesting + "VariableExpression";
    case "Ternary":
      return nesting + parenthesize(
        "Ternary",
        expr.condition,
        expr.whenTrue,
        expr.whenFalse,
      );
    case "Binary":
      return nesting + parenthesize(expr.operator.lexeme, expr.left, expr.right);
    case "Grouping":
      return nesting + parenthesize("group", expr.expression);
    case "Literal":
      if (expr.value == null) {
        return nesting + "nil";
      }
      return nesting + expr.value.toString();
    case "Unary":
      return nesting + parenthesize(expr.operator.lexeme, expr.right);
    default:
      assertUnreachable(expr);
  }
}



function parenthesize(name: string, ...exprs: Expr[]): string {
  let out = `(${name}`;
  exprs.forEach((expr) => {
    out += " ";
    out += expr.nodeType
  });
  out += ")";
  return out;
}
