import React, { memo, useEffect, useState } from "react";
import { API, useParameter, useStorybookApi } from "@storybook/manager-api";
import { BoxIcon } from "@storybook/icons";
import { IconButton } from "@storybook/components";
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import { SNIPPET_RENDERED } from "@storybook/docs-tools";

import { TOOL_ID } from "./constants";
import { parseFileTree, parseImports } from "./utils";

export type CSBParameters =
  | {
      apiToken: string;
      fallbackImport?: string;
      mapComponent?: Record<string, string[] | string | true>;
      dependencies?: Record<string, string>;
      provider?: string;
    }
  | undefined;

export const CodeSandboxTool = memo(function MyAddonSelector({
  api,
}: {
  api: API;
}) {
  const { getCurrentStoryData, addNotification } = useStorybookApi();
  const storyData = getCurrentStoryData();
  const codesandboxParameters: CSBParameters = useParameter("codesandbox");

  const [storySource, setStorySource] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(function getStorySourceCode() {
    api
      .getChannel()
      .on(SNIPPET_RENDERED, ({ source }) => setStorySource(source));
  }, []);

  /**
   * Options
   */
  const options = {
    activeFile: "/App.js",
    mapComponent: codesandboxParameters?.mapComponent ?? {},
    dependencies: codesandboxParameters?.dependencies ?? {},
    provider:
      codesandboxParameters?.provider ??
      `export default GenericProvider = ({ children }) => {
  return children
}`,
  };

  async function createSandbox() {
    try {
      setLoading(true);

      const { fallbackImport } = codesandboxParameters;
      const importsMap = options.mapComponent;

      // If fallbackImport is provided, add it to importsMap
      if (fallbackImport) {
        const componentNames = parseFileTree(storySource);

        // Check if fallbackImport is already in importsMap
        if (importsMap[fallbackImport]) {
          const currentFallbackImport = importsMap[fallbackImport];

          // Merge them
          if (Array.isArray(currentFallbackImport)) {
            importsMap[fallbackImport] = [
              ...new Set([...componentNames, ...currentFallbackImport]),
            ];
          } else {
            // Invalid use case
            throw new Error(
              "Invalid fallback import usage. The `import` used inside `mapComponent` and also used as `fallbackImport` must be an array.",
            );
          }
        } else {
          // Just added (0-config case)
          importsMap[fallbackImport] = componentNames;
        }
      }

      const imports = parseImports(importsMap);

      console.log(imports);

      return;

      /**
       * File: combine & prettify them
       */
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
                ...options.dependencies,
              },
              main: "/src/index.js",
            },
            null,
            2,
          ),
        },
        "src/provider.js": {
          code: options.provider,
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
  ${imports}
  export default App = () => {
    return ${storySource};
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

      if (!codesandboxParameters.apiToken) {
        throw new Error("Missing `apiToken` property");
      }

      const response = await fetch("https://api.codesandbox.io/sandbox", {
        method: "POST",
        body: JSON.stringify({
          title: `${storyData.title} - Storybook`,
          files: prettifiedFiles,
        }),
        headers: {
          Authorization: `Bearer ${codesandboxParameters.apiToken}`,
          "Content-Type": "application/json",
          "X-CSB-API-Version": "2023-07-01",
        },
      });

      const data: { data: { alias: string } } = await response.json();

      window.open(
        `https://codesandbox.io/p/sandbox/${data.data.alias}?file=/src/App.js`,
        "_blank",
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);

      addNotification({
        content: {
          headline: "CodeSandbox: something went wrong",
          subHeadline: error.message,
        },
        id: "csb-error",
        link: "",
      });

      throw error;
    }
  }

  if (!codesandboxParameters || !storySource) {
    return;
  }

  return (
    <IconButton
      style={{ gap: ".5em" }}
      type="button"
      key={TOOL_ID}
      disabled={!options.mapComponent}
      title={
        options.mapComponent
          ? "Open in CodeSandbox"
          : "Missing component mapping"
      }
      onClick={createSandbox}
    >
      <BoxIcon />

      {loading ? "Loading..." : "Open in CodeSandbox"}
    </IconButton>
  );
});

interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;
