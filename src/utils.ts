import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";

import { CSBParameters } from "./Tool";

interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;

export function parseImports(
  mapComponent: Record<string, string | true | string[]>,
) {
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
}

type Props = {
  dependencies: CSBParameters["dependencies"];
  template: CSBParameters["template"];
  provider: CSBParameters["provider"];
  imports: string;
  storySource: string;
};

export function convertSandboxToTemplate(props: Props) {
  switch (props.template) {
    case "react":
      return createReactTemplate(props);
    case "angular":
    // return createAngularTemplate();
    default:
      return;
  }
}

async function createReactTemplate(props: Props) {
  const files = {
    "public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    "package.json": {
      code: JSON.stringify(
        {
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
            "react-scripts": "^5.0.0",
            ...props.dependencies,
          },
          main: "/src/index.js",
        },
        null,
        2,
      ),
    },
    "src/provider.js": {
      code: props.provider,
    },
    "src/index.js": {
      code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GenericProvider from "./provider";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
<StrictMode>
  <GenericProvider>
    <App />
  </GenericProvider>
</StrictMode>
);
`,
    },
    "src/App.js": {
      code: `
${props.imports}
export default App = () => {
return ${props.storySource};
}`,
    },
  };

  const prettifiedFiles: SandpackBundlerFiles = {};
  const ignoredFileExtension = ["json", "html", "md"];

  for (const [key, value] of Object.entries(files)) {
    if (ignoredFileExtension.includes(key.split(".").pop())) {
      prettifiedFiles[key] = value;

      continue;
    }

    prettifiedFiles[key] = {
      ...value,
      code: await prettier.format(value.code, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
      }),
    };
  }

  return files;
}
