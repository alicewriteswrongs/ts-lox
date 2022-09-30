import { LiteralValue } from "./Literal.ts";
import { Stmt } from "./Stmt.ts";
import { Token } from "./Token.ts";

export interface Assign {
  name: Token;
  value: Expr;
  nodeType: "Assign";
}

/**
 * Factory function for creating a Assign record
 *
 * Arguments:
 * @param name Token
 * @param value Expr
 * @returns a Assign node
 */
export function createAssign(
  name: Token,
  value: Expr,
): Assign {
  const newAssign: Assign = {
    name,
    value,
    nodeType: "Assign",
  };
  return newAssign;
}

export interface Ternary {
  condition: Expr;
  token: Token;
  whenTrue: Expr;
  whenFalse: Expr;
  nodeType: "Ternary";
}

/**
 * Factory function for creating a Ternary record
 *
 * Arguments:
 * @param condition Expr
 * @param token Token
 * @param whenTrue Expr
 * @param whenFalse Expr
 * @returns a Ternary node
 */
export function createTernary(
  condition: Expr,
  token: Token,
  whenTrue: Expr,
  whenFalse: Expr,
): Ternary {
  const newTernary: Ternary = {
    condition,
    token,
    whenTrue,
    whenFalse,
    nodeType: "Ternary",
  };
  return newTernary;
}

export interface Binary {
  left: Expr;
  operator: Token;
  right: Expr;
  nodeType: "Binary";
}

/**
 * Factory function for creating a Binary record
 *
 * Arguments:
 * @param left Expr
 * @param operator Token
 * @param right Expr
 * @returns a Binary node
 */
export function createBinary(
  left: Expr,
  operator: Token,
  right: Expr,
): Binary {
  const newBinary: Binary = {
    left,
    operator,
    right,
    nodeType: "Binary",
  };
  return newBinary;
}

export interface Call {
  callee: Expr;
  paren: Token;
  args: Expr[];
  nodeType: "Call";
}

/**
 * Factory function for creating a Call record
 *
 * Arguments:
 * @param callee Expr
 * @param paren Token
 * @param args Expr[]
 * @returns a Call node
 */
export function createCall(
  callee: Expr,
  paren: Token,
  args: Expr[],
): Call {
  const newCall: Call = {
    callee,
    paren,
    args,
    nodeType: "Call",
  };
  return newCall;
}

export interface Get {
  object: Expr;
  name: Token;
  nodeType: "Get";
}

/**
 * Factory function for creating a Get record
 *
 * Arguments:
 * @param object Expr
 * @param name Token
 * @returns a Get node
 */
export function createGet(
  object: Expr,
  name: Token,
): Get {
  const newGet: Get = {
    object,
    name,
    nodeType: "Get",
  };
  return newGet;
}

export interface Grouping {
  expression: Expr;
  nodeType: "Grouping";
}

/**
 * Factory function for creating a Grouping record
 *
 * Arguments:
 * @param expression Expr
 * @returns a Grouping node
 */
export function createGrouping(
  expression: Expr,
): Grouping {
  const newGrouping: Grouping = {
    expression,
    nodeType: "Grouping",
  };
  return newGrouping;
}

export interface Literal {
  value: LiteralValue;
  nodeType: "Literal";
}

/**
 * Factory function for creating a Literal record
 *
 * Arguments:
 * @param value LiteralValue
 * @returns a Literal node
 */
export function createLiteral(
  value: LiteralValue,
): Literal {
  const newLiteral: Literal = {
    value,
    nodeType: "Literal",
  };
  return newLiteral;
}

export interface Logical {
  left: Expr;
  operator: Token;
  right: Expr;
  nodeType: "Logical";
}

/**
 * Factory function for creating a Logical record
 *
 * Arguments:
 * @param left Expr
 * @param operator Token
 * @param right Expr
 * @returns a Logical node
 */
export function createLogical(
  left: Expr,
  operator: Token,
  right: Expr,
): Logical {
  const newLogical: Logical = {
    left,
    operator,
    right,
    nodeType: "Logical",
  };
  return newLogical;
}

export interface SetExpr {
  object: Expr;
  name: Token;
  value: Expr;
  nodeType: "SetExpr";
}

/**
 * Factory function for creating a SetExpr record
 *
 * Arguments:
 * @param object Expr
 * @param name Token
 * @param value Expr
 * @returns a SetExpr node
 */
export function createSetExpr(
  object: Expr,
  name: Token,
  value: Expr,
): SetExpr {
  const newSetExpr: SetExpr = {
    object,
    name,
    value,
    nodeType: "SetExpr",
  };
  return newSetExpr;
}

export interface Super {
  keyword: Token;
  method: Token;
  nodeType: "Super";
}

/**
 * Factory function for creating a Super record
 *
 * Arguments:
 * @param keyword Token
 * @param method Token
 * @returns a Super node
 */
export function createSuper(
  keyword: Token,
  method: Token,
): Super {
  const newSuper: Super = {
    keyword,
    method,
    nodeType: "Super",
  };
  return newSuper;
}

export interface This {
  keyword: Token;
  nodeType: "This";
}

/**
 * Factory function for creating a This record
 *
 * Arguments:
 * @param keyword Token
 * @returns a This node
 */
export function createThis(
  keyword: Token,
): This {
  const newThis: This = {
    keyword,
    nodeType: "This",
  };
  return newThis;
}

export interface Unary {
  operator: Token;
  right: Expr;
  nodeType: "Unary";
}

/**
 * Factory function for creating a Unary record
 *
 * Arguments:
 * @param operator Token
 * @param right Expr
 * @returns a Unary node
 */
export function createUnary(
  operator: Token,
  right: Expr,
): Unary {
  const newUnary: Unary = {
    operator,
    right,
    nodeType: "Unary",
  };
  return newUnary;
}

export interface Variable {
  name: Token;
  nodeType: "Variable";
}

/**
 * Factory function for creating a Variable record
 *
 * Arguments:
 * @param name Token
 * @returns a Variable node
 */
export function createVariable(
  name: Token,
): Variable {
  const newVariable: Variable = {
    name,
    nodeType: "Variable",
  };
  return newVariable;
}

export interface FunctionExpr {
  params: Token[];
  body: Stmt[];
  nodeType: "FunctionExpr";
}

/**
 * Factory function for creating a FunctionExpr record
 *
 * Arguments:
 * @param params Token[]
 * @param body Stmt[]
 * @returns a FunctionExpr node
 */
export function createFunctionExpr(
  params: Token[],
  body: Stmt[],
): FunctionExpr {
  const newFunctionExpr: FunctionExpr = {
    params,
    body,
    nodeType: "FunctionExpr",
  };
  return newFunctionExpr;
}

export type Expr =
  | Assign
  | Ternary
  | Binary
  | Call
  | Get
  | Grouping
  | Literal
  | Logical
  | SetExpr
  | Super
  | This
  | Unary
  | Variable
  | FunctionExpr;

export function isExpr(ASTNode: Stmt | Expr): ASTNode is Expr {
  return [
    "Assign",
    "Ternary",
    "Binary",
    "Call",
    "Get",
    "Grouping",
    "Literal",
    "Logical",
    "SetExpr",
    "Super",
    "This",
    "Unary",
    "Variable",
    "FunctionExpr",
  ].includes(ASTNode.nodeType);
}
