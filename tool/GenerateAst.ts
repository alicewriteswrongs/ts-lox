function main() {
  const args = Deno.args;

  if (args.length != 1) {
    console.log("Usage: generate_ast [output directory]");
    Deno.exit(64);
  } else {
    const outputDir = args[0];

    defineAst(outputDir, "Expr", [
      "Binary   | left: Expr, operator: Token, right: Expr",
      "Grouping | expression: Expr",
      "Literal  | value: LiteralValue",
      "Unary    | operator: Token, right: Expr",
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

  types.forEach((typeString) => {
    const [typeName, fields] = typeString.split("|").map((str) => str.trim());
    defineType(
      lines,
      typeName,
      fields,
    );
  });

  lines.push(`type ${baseName} =`);
  types.forEach((typeString) => {
    const [typeName] = typeString.split("|").map((str) => str.trim());
    lines.push(`| ${typeName}`);
  });

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
    lines.push(` * ${name}: ${type}`);
  });
  lines.push(" */");

  lines.push(`export function create${typeName} (`);
  lines.push(fieldList);
  lines.push(`): ${typeName} {`);

  lines.push(`const new${typeName} = {`);
  fieldList.split(",").forEach((field) => {
    const name = field.split(":")[0].trim();

    lines.push(`${name},`);
  });
  lines.push("}");
  lines.push(`return new${typeName}`);
  lines.push("}");
  lines.push("");
}

main();
