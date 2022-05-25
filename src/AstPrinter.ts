import { Expr } from "./Expr.ts";
import { Stmt } from "./Stmt.ts";
import { assertUnreachable } from "./util.ts";

type AST = Stmt[];

export function printAST(ast: AST, nesting = "") {
  const lines: string[] = [];

  ast.forEach((astNode) => {
    return printStatementNode(astNode, nesting);
  });

  function printStatementNode(stmt: Stmt, nesting = "") {
    switch (stmt.nodeType) {
      case "IfStmt": {
        const { condition, thenBranch, elseBranch } = stmt;

        lines.push("IfStatement");
        lines.push(nesting + "  Condition");
        printExpressionNode(condition, nesting + "    ");
        lines.push(nesting + "  ThenBranch");
        printStatementNode(thenBranch, nesting + "    ");

        if (elseBranch) {
          lines.push(nesting + "  ElseBranch");
          printStatementNode(elseBranch, nesting + "    ");
        }
        break;
      }
      case "BlockStmt": {
        const { statements } = stmt;

        lines.push(nesting + "BlockStatement");
        statements.forEach((statement) =>
          printStatementNode(statement, nesting + "  ")
        );
        break;
      }
      case "ExpressionStmt":
      case "PrintStmt": {
        const { expression } = stmt;

        lines.push(nesting + stmt.nodeType.replace("Stmt", "Statement"));
        printExpressionNode(expression, nesting + "  ");
        break;
      }
      case "VarStmt": {
        const { initializer, name } = stmt;

        lines.push(nesting + `VariableStatement ${name.lexeme}`);
        if (initializer) {
          printExpressionNode(initializer, nesting + "  ");
        }
        break;
      }
      default:
        assertUnreachable(stmt);
    }
  }

  function printExpressionNode(expr: Expr, nesting = "") {
    switch (expr.nodeType) {
      case "Assign": {
        lines.push(nesting + `AssignmentExpression ${expr.name.lexeme}`);
        printExpressionNode(expr.value, nesting + "  ");
        break;
      }
      case "Variable": {
        lines.push(nesting + `VariableExpression ${expr.name.lexeme}`);
        break;
      }
      case "Ternary": {
        lines.push(nesting + "TernaryExpression");
        printExpressionNode(expr.condition, nesting + "  ");
        printExpressionNode(expr.whenTrue, nesting + "  ");
        printExpressionNode(expr.whenFalse, nesting + "  ");
        break;
      }
      case "Binary": {
        lines.push(nesting + `BinaryExpression ${expr.operator.lexeme}`);
        printExpressionNode(expr.left, nesting + "  ");
        printExpressionNode(expr.right, nesting + "  ");
        break;
      }
      case "Grouping": {
        lines.push(nesting + "GroupingExpression");
        printExpressionNode(expr.expression, nesting + "  ");
        break;
      }
      case "Literal": {
        if (expr.value == null) {
          lines.push(nesting + "LiteralExpression nil");
        } else if (typeof expr.value === "string") {
          lines.push(nesting + `LiteralExpression "${expr.value.toString()}"`);
        } else {
          lines.push(nesting + `LiteralExpression ${expr.value.toString()}`);
        }
        break;
      }
      case "Unary": {
        lines.push(nesting + `UnaryExpression ${expr.operator.type}`);
        printExpressionNode(expr.right, nesting + "  ");
        break;
      }
      default:
        assertUnreachable(expr);
    }
  }
  return lines.map((line) => `${nesting}${line}`).join("\n");
}
