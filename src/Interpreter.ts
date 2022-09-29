// deno-lint-ignore-file no-unused-vars no-explicit-any
import { Environment } from "./Environment.ts";
import {
  Assign,
  Binary,
  Call,
  Expr,
  FunctionExpr,
  Get,
  Logical,
  SetExpr,
  Ternary,
  This,
  Unary,
  Variable,
} from "./Expr.ts";
import { GlobalEnvironment } from "./Global.ts";
import { LiteralValue } from "./Literal.ts";
import { isLoxCallable, LoxFunction } from "./LoxCallable.ts";
import { LoxClass, LoxInstance } from "./LoxClass.ts";
import { Return } from "./Return.ts";
import { RuntimeError } from "./RuntimeError.ts";
import {
  ClassStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  VarStmt,
  WhileStmt,
} from "./Stmt.ts";
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
): Environment {
  // if there is no environment this call to `interpret` is the first one when
  // dealing with a syntax tree, so we should just create a `GlobalEnvironment`
  // if it's not present.
  const env = environment || new GlobalEnvironment();
  try {
    return statements.reduce(execute, env);
  } catch (err) {
    if (err instanceof RuntimeError) {
      error(err.token.line, err.message);
    }
    return env;
  }
}

function execute(environment: Environment, statement: Stmt): Environment {
  switch (statement.nodeType) {
    case "VarStmt": {
      const varEnv = new Environment(environment);
      interpretVarStmt(statement, varEnv);
      return varEnv;
    }
    case "ExpressionStmt":
      interpretExpressionStmt(statement, environment);
      return environment;
    case "PrintStmt":
      interpretPrintStmt(statement, environment);
      return environment;
    case "BlockStmt":
      interpretBlockStmt(statement.statements, new Environment(environment));
      return environment;
    case "IfStmt":
      interpretIfStmt(statement, environment);
      return environment;
    case "WhileStmt":
      interpretWhileStmt(statement, environment);
      return environment;
    case "FunctionStmt":
      interpretFuncStmt(statement, environment);
      return environment;
    case "ReturnStmt":
      interpretReturnStatement(statement, environment);
      return environment;
    case "ClassStmt":
      interpretClassStatement(statement, environment);
      return environment;
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

export function interpretBlockStmt(statements: Stmt[], env: Environment) {
  statements.reduce(execute, env);
}

function interpretIfStmt(stmt: IfStmt, environment: Environment) {
  if (isTruthy(interpretExpression(stmt.condition, environment))) {
    execute(environment, stmt.thenBranch);
  } else if (stmt.elseBranch !== undefined) {
    execute(environment, stmt.elseBranch);
  }
  return null;
}

function interpretWhileStmt(stmt: WhileStmt, environment: Environment) {
  while (isTruthy(interpretExpression(stmt.condition, environment))) {
    execute(environment, stmt.body);
  }
}

function interpretFuncStmt(stmt: FunctionStmt, environment: Environment) {
  const func = new LoxFunction(stmt.func, environment, false, stmt.name);
  environment.define(stmt.name.lexeme, func);
  return null;
}

function interpretReturnStatement(stmt: ReturnStmt, environment: Environment) {
  let value = null;
  if (stmt.value !== null) {
    value = interpretExpression(stmt.value, environment);

    throw new Return(value);
  }
}

function interpretClassStatement(stmt: ClassStmt, environment: Environment) {
  environment.define(stmt.name.lexeme, null);

  const methods = new Map();

  for (const method of stmt.methods) {
    const func = new LoxFunction(
      method.func,
      environment,
      method.name.lexeme === "init",
      method.name,
    );

    methods.set(method.name.lexeme, func);
  }

  const klass = new LoxClass(stmt.name.lexeme, methods);
  environment.assign(stmt.name, klass);
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
): LiteralValue | LoxFunction | LoxInstance {
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
    case "Call":
      return interpretCall(expr, env);
    case "FunctionExpr":
      return interpretFuncExpr(expr, env);
    case "Get":
      return interpretGet(expr, env);
    case "SetExpr":
      return interpretSet(expr, env);
    case "This":
      return interpretThis(expr, env);
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
function isTruthy(value: LiteralValue | LoxFunction | LoxInstance): boolean {
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

function isEqual(
  a: LiteralValue | LoxFunction | LoxInstance,
  b: LiteralValue | LoxFunction | LoxInstance,
) {
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

function interpretCall(expr: Call, environment: Environment) {
  const callee = interpretExpression(expr.callee, environment);

  const evaluatedArgs = expr.args.map((argument) =>
    interpretExpression(argument, environment)
  );

  if (!isLoxCallable(callee)) {
    throw new RuntimeError(
      expr.paren,
      "Can only call functions and classes.",
    );
  }

  if (callee.arity() !== evaluatedArgs.length) {
    throw new RuntimeError(
      expr.paren,
      `Expected ${callee.arity()} arguments but got ${evaluatedArgs.length}`,
    );
  }

  return callee.call(environment, evaluatedArgs);
}

function interpretFuncExpr(expr: FunctionExpr, environment: Environment) {
  return new LoxFunction(expr, environment, false);
}

function interpretGet(expr: Get, environment: Environment) {
  const object = interpretExpression(expr.object, environment);

  if (object instanceof LoxInstance) {
    return object.get(expr.name);
  }
}

function interpretSet(expr: SetExpr, environment: Environment) {
  const object = interpretExpression(expr.object, environment);

  if (!(object instanceof LoxInstance)) {
    throw new RuntimeError(
      expr.name,
      "Only instances have fields.",
    );
  }

  const value = interpretExpression(expr.value, environment);
  object.set(expr.name, value);
  return value;
}

function interpretThis(expr: This, environment: Environment) {
  return environment.get(expr.keyword);
}
