import React, { memo, useEffect, useState } from "react";
import { API, useParameter, useStorybookApi } from "@storybook/manager-api";
import { Button } from "@storybook/components";
import { BoxIcon } from "@storybook/icons";
import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";

import { TOOL_ID } from "./constants";

const SNIPPET_RENDERED = `storybook/docs/snippet-rendered`;

type CSBParameters =
  | {
      /**
       * CodeSandbox workspace id where sandbox will be created.
       * @required
       */
      workspaceAPIKey: string;

      /**
       * Key/value mapping of components to import in the sandbox
       * @optional
       */
      mapComponent?: Record<string, string[] | string | true>;

      /**
       * List of dependencies to install in the sandbox
       * @optional
       */
      dependencies?: Record<string, string>;

      /**
       * All required providers to run the sandbox properly, such as
       * themes, i18n, store, and so on.
       * @optional
       */
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

  async function createSandbox() {
    try {
      setLoading(true);

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

      /**
       * Parse story imports
       */
      let imports = ``;
      for (const [key, value] of Object.entries(options.mapComponent)) {
        if (Array.isArray(value)) {
          imports += `import { ${value.join(", ")} } from '${key}';\n`;
        } else if (value === true) {
          imports += `import '${key}';\n`;
        } else if (typeof value === "string") {
          imports += `import ${value} from '${key}';\n`;
        }
      }

      /**
       * File: combine & prettify them
       */
      const files = {
        "/package.json": {
          code: JSON.stringify({
            dependencies: {
              react: "^18.0.0",
              "react-dom": "^18.0.0",
              "react-scripts": "^5.0.0",
              ...options.dependencies,
            },
            main: "/index.js",
          }),
        },
        "/provider.js": {
          code: options.provider,
        },
        "/index.js": {
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
        "/App.js": {
          code: `
  ${imports}
  export default App = () => {
    return ${storySource};
  }`,
        },
      };

      const prettifiedFiles: SandpackBundlerFiles = {};
      const ignoredFileExtension = ["json"];

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

      const response = await fetch("https://api.codesandbox.io/sandbox", {
        method: "POST",
        body: JSON.stringify({
          title: `${storyData.title} - Storybook`,
          files: prettifiedFiles,
        }),
        headers: {
          Authorization: `Bearer ${codesandboxParameters.workspaceAPIKey}`,
          "Content-Type": "application/json",
          "X-CSB-API-Version": "2023-07-01",
        },
      });

      const data: { data: { alias: string } } = await response.json();

      window.open(
        `https://codesandbox.io/p/sandbox/${data.data.alias}`,
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
    <Button
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
    </Button>
  );
});

interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;
