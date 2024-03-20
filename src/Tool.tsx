import React, { memo, useEffect, useState } from "react";
import { API, useParameter } from "@storybook/manager-api";
import { Button } from "@storybook/components";
import LZString from "lz-string";
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
      workspaceId: string;

      /**
       * Key/value mapping of components to import in the sandbox
       * @optional
       */
      mapComponent?: Record<string, string[]>;

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
  const formRef = React.useRef<HTMLFormElement>(null);
  const [storySource, setStorySource] = useState();
  let codesandboxParameters: CSBParameters = useParameter("codesandbox");
  const [deferredFiles, setDeferredFiles] = useState<SandpackBundlerFiles>({});

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
    workspaceId: codesandboxParameters?.workspaceId,
    mapComponent: codesandboxParameters?.mapComponent ?? {},
    dependencies: codesandboxParameters?.dependencies ?? {},
    provider:
      codesandboxParameters?.provider ??
      `export default GenericProvider = ({ children }) => {
  return children
}`,
  };

  useEffect(() => {
    (async function mountFiles() {
      /**
       * Parse story imports
       */
      let imports = ``;
      for (const [key, value] of Object.entries(options.mapComponent)) {
        imports += `import { ${value.join(", ")} } from '${key}';\n`;
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

      setDeferredFiles(prettifiedFiles);
    })();
  }, [storySource]);

  if (!codesandboxParameters || !storySource) {
    return;
  }

  const params = getFileParameters(deferredFiles);

  const searchParams = new URLSearchParams({
    parameters: params,
    query: new URLSearchParams({
      file: options.activeFile,
      utm_medium: "storybook",
    }).toString(),
  });

  return (
    <Button
      key={TOOL_ID}
      disabled={!options.mapComponent}
      title={
        options.mapComponent
          ? "Open in CodeSandbox"
          : "Missing component mapping"
      }
      onClick={(): void => formRef.current?.submit()}
    >
      <form
        action={CSB_URL}
        method="POST"
        style={{ display: "none" }}
        target="_blank"
        ref={formRef}
      >
        {Array.from(
          searchParams as unknown as Array<[string, string]>,
          ([key, value]) => (
            <input key={key} name={key} type="hidden" value={value} />
          ),
        )}
      </form>
      <BoxIcon />
      Open in CodeSandbox
    </Button>
  );
});

const CSB_URL = "https://codesandbox.io/api/v1/sandboxes/define";

export interface SandpackBundlerFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

export type SandpackBundlerFiles = Record<string, SandpackBundlerFile>;
const getFileParameters = (files: SandpackBundlerFiles): string => {
  type NormalizedFiles = Record<
    string,
    {
      content: string;
      isBinary: boolean;
    }
  >;

  const normalizedFiles = Object.keys(files).reduce((prev, next) => {
    const fileName = next.replace("/", "");
    const value = {
      content: files[next].code,
      isBinary: false,
    };

    return { ...prev, [fileName]: value };
  }, {} as NormalizedFiles);

  return getParameters({
    files: normalizedFiles,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getParameters = (parameters: Record<string, any>): string =>
  LZString.compressToBase64(JSON.stringify(parameters))
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); /* Remove ending '='*/
