import { Expr, FunctionExpr } from "./Expr.ts";
import { Token } from "./Token.ts";

export interface BlockStmt {
  statements: Stmt[];
  nodeType: "BlockStmt";
}

/**
 * Factory function for creating a BlockStmt record
 *
 * Arguments:
 * @param statements Stmt[]
 * @returns a BlockStmt node
 */
export function createBlockStmt(
  statements: Stmt[],
): BlockStmt {
  const newBlockStmt: BlockStmt = {
    statements,
    nodeType: "BlockStmt",
  };
  return newBlockStmt;
}

export interface ClassStmt {
  name: Token;
  methods: FunctionStmt[];
  nodeType: "ClassStmt";
}

/**
 * Factory function for creating a ClassStmt record
 *
 * Arguments:
 * @param name Token
 * @param methods FunctionStmt[]
 * @returns a ClassStmt node
 */
export function createClassStmt(
  name: Token,
  methods: FunctionStmt[],
): ClassStmt {
  const newClassStmt: ClassStmt = {
    name,
    methods,
    nodeType: "ClassStmt",
  };
  return newClassStmt;
}

export interface ExpressionStmt {
  expression: Expr;
  nodeType: "ExpressionStmt";
}

/**
 * Factory function for creating a ExpressionStmt record
 *
 * Arguments:
 * @param expression Expr
 * @returns a ExpressionStmt node
 */
export function createExpressionStmt(
  expression: Expr,
): ExpressionStmt {
  const newExpressionStmt: ExpressionStmt = {
    expression,
    nodeType: "ExpressionStmt",
  };
  return newExpressionStmt;
}

export interface FunctionStmt {
  name: Token;
  func: FunctionExpr;
  nodeType: "FunctionStmt";
}

/**
 * Factory function for creating a FunctionStmt record
 *
 * Arguments:
 * @param name Token
 * @param func FunctionExpr
 * @returns a FunctionStmt node
 */
export function createFunctionStmt(
  name: Token,
  func: FunctionExpr,
): FunctionStmt {
  const newFunctionStmt: FunctionStmt = {
    name,
    func,
    nodeType: "FunctionStmt",
  };
  return newFunctionStmt;
}

export interface IfStmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch?: Stmt;
  nodeType: "IfStmt";
}

/**
 * Factory function for creating a IfStmt record
 *
 * Arguments:
 * @param condition Expr
 * @param thenBranch Stmt
 * @param elseBranch? Stmt
 * @returns a IfStmt node
 */
export function createIfStmt(
  condition: Expr,
  thenBranch: Stmt,
  elseBranch?: Stmt,
): IfStmt {
  const newIfStmt: IfStmt = {
    condition,
    thenBranch,
    elseBranch,
    nodeType: "IfStmt",
  };
  return newIfStmt;
}

export interface PrintStmt {
  expression: Expr;
  nodeType: "PrintStmt";
}

/**
 * Factory function for creating a PrintStmt record
 *
 * Arguments:
 * @param expression Expr
 * @returns a PrintStmt node
 */
export function createPrintStmt(
  expression: Expr,
): PrintStmt {
  const newPrintStmt: PrintStmt = {
    expression,
    nodeType: "PrintStmt",
  };
  return newPrintStmt;
}

export interface ReturnStmt {
  keyword: Token;
  value: Expr | null;
  nodeType: "ReturnStmt";
}

/**
 * Factory function for creating a ReturnStmt record
 *
 * Arguments:
 * @param keyword Token
 * @param value Expr | null
 * @returns a ReturnStmt node
 */
export function createReturnStmt(
  keyword: Token,
  value: Expr | null,
): ReturnStmt {
  const newReturnStmt: ReturnStmt = {
    keyword,
    value,
    nodeType: "ReturnStmt",
  };
  return newReturnStmt;
}

export interface VarStmt {
  name: Token;
  initializer?: Expr;
  nodeType: "VarStmt";
}

/**
 * Factory function for creating a VarStmt record
 *
 * Arguments:
 * @param name Token
 * @param initializer? Expr
 * @returns a VarStmt node
 */
export function createVarStmt(
  name: Token,
  initializer?: Expr,
): VarStmt {
  const newVarStmt: VarStmt = {
    name,
    initializer,
    nodeType: "VarStmt",
  };
  return newVarStmt;
}

export interface WhileStmt {
  condition: Expr;
  body: Stmt;
  nodeType: "WhileStmt";
}

/**
 * Factory function for creating a WhileStmt record
 *
 * Arguments:
 * @param condition Expr
 * @param body Stmt
 * @returns a WhileStmt node
 */
export function createWhileStmt(
  condition: Expr,
  body: Stmt,
): WhileStmt {
  const newWhileStmt: WhileStmt = {
    condition,
    body,
    nodeType: "WhileStmt",
  };
  return newWhileStmt;
}

export type Stmt =
  | BlockStmt
  | ClassStmt
  | ExpressionStmt
  | FunctionStmt
  | IfStmt
  | PrintStmt
  | ReturnStmt
  | VarStmt
  | WhileStmt;

export function isStmt(ASTNode: Stmt | Expr): ASTNode is Stmt {
  return [
    "BlockStmt",
    "ClassStmt",
    "ExpressionStmt",
    "FunctionStmt",
    "IfStmt",
    "PrintStmt",
    "ReturnStmt",
    "VarStmt",
    "WhileStmt",
  ].includes(ASTNode.nodeType);
}
