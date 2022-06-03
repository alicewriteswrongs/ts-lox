import { Environment } from "./Environment.ts";
import {
  Assign,
  Binary,
  Expr,
  Logical,
  Ternary,
  Unary,
  Variable,
} from "./Expr.ts";
import { LiteralValue } from "./Literal.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { ExpressionStmt, IfStmt, PrintStmt, Stmt, VarStmt } from "./Stmt.ts";
import { Token, TokenType } from "./Token.ts";
import { ErrorFunc } from "./types/error.ts";
import { assertUnreachable } from "./util.ts";

/**
 * This is the entry point for the interpreter. It creates an environment and
 * then wraps calling `execute` on all the statements it is passed in a try /
 * catch.
 *
 * There is an optional `environment` param for this function which is used to
 * allow setting variables in the REPL — in the REPL we call `interpret` on
 * each line, but in order to allow variables to be set and used again later we
 * need to keep an `Environment` around between calls to `interpret`.
 */
export function interpret(
  statements: Stmt[],
  error: ErrorFunc,
  environment?: Environment,
) {
  const env = environment || new Environment();
  try {
    statements.forEach((stmt) => execute(stmt, env));
  } catch (err) {
    if (err instanceof RuntimeError) {
      error(err.token.line, err.message);
    }
  }
}

function execute(statement: Stmt, environment: Environment) {
  switch (statement.nodeType) {
    case "VarStmt":
      interpretVarStmt(statement, environment);
      break;
    case "ExpressionStmt":
      interpretExpressionStmt(statement, environment);
      break;
    case "PrintStmt":
      interpretPrintStmt(statement, environment);
      break;
    case "BlockStmt":
      interpretBlockStmt(statement.statements, new Environment(environment));
      break;
    case "IfStmt":
      interpretIfStmt(statement, environment);
      break;
    default:
      assertUnreachable(statement);
  }
}

function interpretVarStmt(statement: VarStmt, environment: Environment) {
  let value = null;
  if (statement.initializer) {
    value = interpretExpression(statement.initializer, environment);
  }

  environment.define(statement.name.lexeme, value);
}

function interpretExpressionStmt(
  statement: ExpressionStmt,
  environment: Environment,
): void {
  const _value = interpretExpression(statement.expression, environment);
  return;
}

function interpretPrintStmt(
  statement: PrintStmt,
  environment: Environment,
): void {
  const value = interpretExpression(statement.expression, environment);
  console.log(stringify(value));
}

function interpretBlockStmt(statements: Stmt[], env: Environment) {
  for (const statement of statements) {
    execute(statement, env);
  }
}

function interpretIfStmt(stmt: IfStmt, environment: Environment) {
  if (isTruthy(interpretExpression(stmt.condition, environment))) {
    execute(stmt.thenBranch, environment);
  } else if (stmt.elseBranch !== undefined) {
    execute(stmt.elseBranch, environment);
  }
  return null;
}

export function stringify(value: any) {
  if (value === null) {
    return "nil";
  }

  if (typeof value === "number") {
    const string = String(value);
    return string;
  }

  return String(value);
}

/**
 * This function handles interpreting expressions, dispatching to specific
 * functions for each type of expression that Lox supports.
 */
export function interpretExpression(
  expr: Expr,
  env: Environment,
): LiteralValue {
  switch (expr.nodeType) {
    case "Assign":
      return interpretAssignExpression(expr, env);
    case "Literal":
      return expr.value;
    case "Grouping":
      return interpretExpression(expr.expression, env);
    case "Unary":
      return interpretUnary(expr, env);
    case "Binary":
      return interpretBinary(expr, env);
    case "Ternary":
      return interpretTernary(expr, env);
    case "Variable":
      return interpretVariable(expr, env);
    case "Logical":
      return interpretLogical(expr, env);
    default:
      assertUnreachable(expr);
  }
}

function interpretAssignExpression(expr: Assign, env: Environment) {
  const value = interpretExpression(expr.value, env);
  env.assign(expr.name, value);
  return value;
}

function interpretUnary(expr: Unary, environment: Environment) {
  const right = interpretExpression(expr.right, environment);

  switch (expr.operator.type) {
    case TokenType.MINUS:
      return -Number(right);
    case TokenType.BANG:
      return !isTruthy(right);
  }
  return right;
}

/**
 * This function tells us whether a value is truthy or not! We adhere to a pretty
 * simple definition of truthiness: if it's null or `false` then it's _not_ truthy,
 * else it is (so "", [], 0, 1, 2, 3, etc are all truthy)
 */
function isTruthy(value: LiteralValue): boolean {
  if (value === null) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return true;
}

function interpretBinary(expr: Binary, environment: Environment): LiteralValue {
  const left = interpretExpression(expr.left, environment);
  const right = interpretExpression(expr.right, environment);

  switch (expr.operator.type) {
    case TokenType.MINUS:
      checkNumberOperand(expr.operator, right);
      return Number(left) - Number(right);
    case TokenType.SLASH:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) / Number(right);
    case TokenType.STAR:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) * Number(right);
    case TokenType.PLUS:
      if (typeof left === "string" && typeof right === "string") {
        return left + right;
      }
      if (typeof left === "number" && typeof right === "number") {
        return left + right;
      }
      throw new RuntimeError(
        expr.operator,
        "Operands must be two numbers or two strings.",
      );
    case TokenType.GREATER:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) > Number(right);
    case TokenType.GREATER_EQUAL:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) >= Number(right);
    case TokenType.LESS:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) < Number(right);
    case TokenType.LESS_EQUAL:
      checkNumberOperands(expr.operator, left, right);
      return Number(left) <= Number(right);
    case TokenType.BANG_EQUAL:
      checkNumberOperands(expr.operator, left, right);
      return !isEqual(left, right);
    case TokenType.EQUAL_EQUAL:
      checkNumberOperands(expr.operator, left, right);
      return isEqual(left, right);
  }

  // we shouldn't get here
  throw new Error();
}

function isEqual(a: LiteralValue, b: LiteralValue) {
  if (a === null && b === null) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }
  return a === b;
}

function interpretTernary(expr: Ternary, environment: Environment) {
  const condition = interpretExpression(expr.condition, environment);

  // let's do a short-circuit evaluation

  if (isTruthy(condition)) {
    const ifTrue = interpretExpression(expr.whenTrue, environment);
    return ifTrue;
  } else {
    const ifFalse = interpretExpression(expr.whenFalse, environment);
    return ifFalse;
  }
}

// Runtime type-checking functions
//
// these are all pretty basic

function checkNumberOperand(operator: Token, operand: any) {
  if (typeof operand === "number") {
    return;
  }
  throw new RuntimeError(operator, "Operand must be a number");
}

function checkNumberOperands(operator: Token, left: any, right: any) {
  if (typeof left === "number" && typeof right === "number") {
    return;
  }
  throw new RuntimeError(operator, "Operands must be numbers");
}

function interpretVariable(expr: Variable, environment: Environment) {
  return environment.get(expr.name);
}

function interpretLogical(expr: Logical, environment: Environment) {
  const left = interpretExpression(expr.left, environment);

  if (expr.operator.type === TokenType.OR) {
    // if we have an OR, short-circuit by looking at `left` first
    // and return if it is truthy
    if (isTruthy(left)) return left;
  } else {
    // if we have an AND, short-circuit by looking at `left first
    // and return it if it is _not_ truthy
    // thus if you `false and foobar()` we return false early
    // without bothering to call foobar
    if (!isTruthy(left)) return left;
  }

  return interpretExpression(expr.right, environment);
}
