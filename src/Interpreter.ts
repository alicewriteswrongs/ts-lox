import { Binary, Expr, Ternary, Unary } from "./Expr.ts";
import { LiteralValue } from "./Literal.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token, TokenType } from "./Token.ts";
import { ErrorFunc } from "./types/error.ts";

export function interpret(expression: Expr, error: ErrorFunc) {
  try {
    const value = recursiveInterpret(expression);
    return stringify(value);
  } catch (err) {
    if (err instanceof RuntimeError) {
      error(err.token.line, err.message);
    }
  }
}

function stringify(value: any) {
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
 * This function does the real work of recurring down the AST
 * and interpreting everything.
 */
export function recursiveInterpret(expr: Expr): LiteralValue {
  switch (expr.exprType) {
    case "Literal":
      return expr.value;
    case "Grouping":
      return recursiveInterpret(expr.expression);
    case "Unary":
      return interpretUnary(expr);
    case "Binary":
      return interpretBinary(expr);
    case "Ternary":
      return interpretTernary(expr);
  }
}

function interpretUnary(expr: Unary) {
  const right = recursiveInterpret(expr.right);

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

function interpretBinary(expr: Binary): LiteralValue {
  const left = recursiveInterpret(expr.left);
  const right = recursiveInterpret(expr.right);

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

function interpretTernary(expr: Ternary) {
  const condition = recursiveInterpret(expr.condition);

  // let's do a short-circuit evaluation

  if (isTruthy(condition)) {
    const ifTrue = recursiveInterpret(expr.whenTrue);
    return ifTrue;
  } else {
    const ifFalse = recursiveInterpret(expr.whenFalse);
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
