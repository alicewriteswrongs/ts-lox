function main() {
  const args = Deno.args;

  if (args.length != 1) {
    console.log("Usage: generate_ast [output directory]");
    Deno.exit(64);
  } else {
    const outputDir = args[0];

    defineAst(outputDir, "Expr", [
      "Assign       -> name: Token, value: Expr",
      "Ternary      -> condition: Expr, token: Token, whenTrue: Expr, whenFalse: Expr",
      "Binary       -> left: Expr, operator: Token, right: Expr",
      "Call         -> callee: Expr, paren: Token, args: Expr[]",
      "Get          -> object: Expr, name: Token",
      "Grouping     -> expression: Expr",
      "Literal      -> value: LiteralValue",
      "Logical      -> left: Expr, operator: Token, right: Expr",
      "SetExpr      -> object: Expr, name: Token, value: Expr",
      "Super        -> keyword: Token, method: Token",
      "This         -> keyword: Token",
      "Unary        -> operator: Token, right: Expr",
      "Variable     -> name: Token",
      "FunctionExpr -> params: Token[], body: Stmt[]",
    ]);

    defineAst(outputDir, "Stmt", [
      "BlockStmt       -> statements: Stmt[]",
      "ClassStmt       -> name: Token, methods: (FunctionStmt | ClassMethodStmt)[], superclass?: Variable",
      "ExpressionStmt  -> expression: Expr",
      "FunctionStmt    -> name: Token, func: FunctionExpr",
      "ClassMethodStmt -> name: Token, func: FunctionExpr",
      "IfStmt          -> condition: Expr, thenBranch: Stmt, elseBranch?: Stmt",
      "PrintStmt       -> expression: Expr",
      "ReturnStmt      -> keyword: Token, value: Expr | null",
      "VarStmt         -> name: Token, initializer?: Expr",
      "WhileStmt       -> condition: Expr, body: Stmt",
    ]);
  }
}

function defineAst(
  outputDir: string,
  baseName: string,
  types: string[],
) {
  const path = outputDir + "/" + baseName + ".ts";

  const lines: string[] = [];

  lines.push('import { Token } from "./Token.ts"');
  lines.push('import { LiteralValue } from "./Literal.ts"');
  lines.push("");

  const typeNameToFields = types.map((typeString) =>
    typeString
      .split("->")
      .map((str) => str.trim())
  );

  typeNameToFields.forEach(([typeName, fields]) => {
    defineType(
      lines,
      typeName,
      fields,
    );
  });

  // add union type for all these things
  lines.push(`export type ${baseName} =`);
  types.forEach((typeString) => {
    const [typeName] = typeString.split("->").map((str) => str.trim());
    lines.push(`| ${typeName}`);
  });
  lines.push("");

  // add a 'is this a ${nodeType}?' function
  lines.push(
    `export function is${baseName}(ASTNode: Stmt | Expr): ASTNode is ${baseName} {`,
  );
  lines.push("return [");
  typeNameToFields.forEach(([typeName]) => lines.push(`"${typeName}",`));
  lines.push("].includes(ASTNode.nodeType)");
  lines.push("}");
  lines.push("");

  const encoder = new TextEncoder();
  Deno.writeFileSync(path, encoder.encode(lines.join("\n")));
}

function defineType(
  lines: string[],
  typeName: string,
  fieldList: string,
) {
  // write the interface declaration
  lines.push(`export interface ${typeName} {`);
  fieldList.split(",").forEach((field) => {
    lines.push(field);
  });
  lines.push(`nodeType: "${typeName}"`);
  lines.push("}");
  lines.push("");
  /**
   * description
   */

  // add a factory function
  lines.push("/**");
  lines.push(` * Factory function for creating a ${typeName} record`);
  lines.push(" *");
  lines.push(" * Arguments:");
  fieldList.split(",").forEach((field) => {
    const [name, type] = field.split(":").map((str) => str.trim());
    lines.push(` * @param ${name} ${type}`);
  });
  lines.push(` * @returns a ${typeName} node`);
  lines.push(" */");

  lines.push(`export function create${typeName} (`);
  lines.push(fieldList);
  lines.push(`): ${typeName} {`);

  lines.push(`const new${typeName}: ${typeName} = {`);
  fieldList.split(",").forEach((field) => {
    const name = field.split(":")[0].trim();

    lines.push(`${name},`);
  });
  lines.push(`nodeType: "${typeName}"`);
  lines.push("}");
  lines.push(`return new${typeName}`);
  lines.push("}");
  lines.push("");
}

main();
