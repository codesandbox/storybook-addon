import { CSBParameters } from "./Tool";
import ts from "typescript";

export const parseImports = (
  mapComponent: Required<CSBParameters["mapComponent"]>,
) => {
  let imports = ``;

  for (const [key, value] of Object.entries(mapComponent)) {
    if (Array.isArray(value)) {
      imports += `import { ${value.join(", ")} } from '${key}';\n`;
    } else if (value === true) {
      imports += `import '${key}';\n`;
    } else if (typeof value === "string") {
      imports += `import ${value} from '${key}';\n`;
    }
  }

  return imports;
};

/**
 * Parse the source code with TreeSitter and return the component names
 */
export function parseFileTree(sourceCode: string): Array<string> {
  const parsed = ts.createSourceFile(
    "story.tsx",
    sourceCode,
    ts.ScriptTarget.ESNext,
  );

  const program = ts.createProgram({
    rootNames: ["/story.tsx"],
    host: {
      readFile(_fileName) {
        return sourceCode;
      },
      getSourceFile(_fileName) {
        return parsed;
      },
      writeFile() {},
      getDefaultLibFileName() {
        return "lib.d.ts";
      },
      useCaseSensitiveFileNames() {
        return false;
      },
      getCurrentDirectory() {
        return "/";
      },
      getCanonicalFileName() {
        return "/story.tsx";
      },
      getNewLine() {
        return "\n";
      },
      fileExists() {
        return true;
      },
      getDirectories() {
        return [];
      },
    },
    options: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });

  const checker = program.getTypeChecker();

  const components: Array<string> = [];

  function addTagName(tagName: ts.JsxTagNameExpression) {
    if (!ts.isIdentifier(tagName)) {
      return;
    }

    // Check if the variable is declared already in the source file,
    // we only want variables that are not already declared.
    const symbol = checker.getSymbolAtLocation(tagName);
    const declarations = symbol?.getDeclarations();
    if (declarations) {
      return;
    }

    const componentName = tagName.getText(parsed);
    if (componentName[0].toUpperCase() === componentName[0]) {
      components.push(componentName);
    }
  }

  function walk(node: ts.Node) {
    if (ts.isJsxOpeningElement(node)) {
      addTagName(node.tagName);
    } else if (ts.isJsxSelfClosingElement(node)) {
      addTagName(node.tagName);
    }

    node.forEachChild((w) => walk(w));
  }
  walk(parsed);

  return components;
}
