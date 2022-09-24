import { Expr } from "./Expr.ts";
import { Stmt } from "./Stmt.ts";
import { TokenType } from "./Token.ts";
import { assertUnreachable } from "./util.ts";

type AST = Stmt[];

/**
 * An AST pretty printer which prints out a human-readable and simple
 * visualization of the AST which shows structure through indentation
 * and nesting.
 *
 * A simple bit of Lox code like `print "foo";` will be printed as:
 *
 * ```
 * PrintStatement
 *   LiteralExpression "foo"
 * ```
 *
 * More complicated bits of code get a little more, well, complicated:
 *
 * ```
 * while (shouldWeQuit ? false : true) {
 *   print "hey!";
 * }
 * ```
 * prints to
 *
 * ```
 * WhileStatement
 *   Condition
 *     TernaryExpression
 *       VariableExpression shouldWeQuit
 *       LiteralExpression false
 *       LiteralExpression true
 *   Body
 *     BlockStatement
 *       PrintStatement
 *         LiteralExpression "hey"
 * ```
 */
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
      case "WhileStmt": {
        const { condition, body } = stmt;

        lines.push(nesting + "WhileStatement");
        lines.push(nesting + "  Condition");
        printExpressionNode(condition, "    ");
        lines.push(nesting + "  Body");
        printStatementNode(body, "    ");
        break;
      }
      case "FunctionStmt": {
        const { name } = stmt;
        const { body, params } = stmt.func;

        lines.push(nesting + "FunctionDeclaration " + name.lexeme);
        lines.push(nesting + "  Parameters");
        params.forEach((token) => lines.push(nesting + "    " + token.lexeme));
        lines.push(nesting + "  Body");
        body.forEach((statement) =>
          printStatementNode(statement, nesting + "    ")
        );
        break;
      }
      case "ReturnStmt": {
        const { value } = stmt;

        if (value === null) {
          lines.push(nesting + "ReturnStatement <void>");
        } else {
          lines.push(nesting + "ReturnStatement");
          printExpressionNode(value, nesting + "  ");
        }
        break;
      }
      case "ClassStmt": {
        const { name, methods } = stmt;

        lines.push(nesting + "ClassDeclaration " + name.lexeme);
        for (const func of methods) {
          printStatementNode(func, nesting + "  ");
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
      case "Logical": {
        const expressionType = expr.operator.type === TokenType.AND
          ? "And"
          : "Or";
        lines.push(nesting + `LogicalExpression ${expressionType}`);
        printExpressionNode(expr.left, nesting + "  ");
        printExpressionNode(expr.right, nesting + "  ");
        break;
      }
      case "Call": {
        lines.push(nesting + `FunctionCall`);
        lines.push(nesting + `  callee:`);
        printExpressionNode(expr.callee, nesting + "    ");
        if (expr.args.length > 0) {
          lines.push(nesting + "  arguments:");
          expr.args.forEach((arg) => {
            printExpressionNode(arg, nesting + "    ");
          });
        }
        break;
      }
      case "FunctionExpr": {
        const { body, params } = expr;

        lines.push(nesting + "FunctionExpression");
        lines.push(nesting + "  Parameters");
        params.forEach((token) => lines.push(nesting + "    " + token.lexeme));
        lines.push(nesting + "  Body");
        body.forEach((statement) =>
          printStatementNode(statement, nesting + "    ")
        );
        break;
      }
      case "Get": {
        const { object, name } = expr;

        lines.push(nesting + "PropertyAccess");
        lines.push(
          nesting + "  Accessing " + name.lexeme + " on " + object.nodeType,
        );
        break;
      }
      case "Set": {
        const { object, name } = expr;

        lines.push(nesting + "SetExpession");
        lines.push(
          nesting + "  Settings " + name.lexeme + " on " + object.nodeType,
        );
        break;
      }
      default:
        assertUnreachable(expr);
    }
  }
  return lines.map((line) => `${nesting}${line}`).join("\n");
}
