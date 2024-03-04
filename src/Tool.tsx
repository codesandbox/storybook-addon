import React, { memo, useEffect, useState } from "react";
import { API, useParameter } from "@storybook/manager-api";
import { Icons, Button } from "@storybook/components";
import { TOOL_ID } from "./constants";
import LZString from "lz-string";

const ADDON_ID = "storybook/docs";
const SNIPPET_RENDERED = `${ADDON_ID}/snippet-rendered`;

export const Tool = memo(function MyAddonSelector({ api }: { api: API }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [storySource, setStorySource] = useState();
  const codesandboxParameters:
    | { mapComponent: Record<string, string[]> }
    | undefined = useParameter("codesandbox");

  useEffect(() => {
    api
      .getChannel()
      .on(SNIPPET_RENDERED, ({ source }) => setStorySource(source));
  }, []);

  let imports = ``;
  for (const [key, value] of Object.entries(
    codesandboxParameters?.mapComponent ?? {},
  )) {
    imports += `import { ${value.join(", ")} } from '${key}';\n`;
  }

  const files = {
    "/package.json": {
      code: JSON.stringify({
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          "react-scripts": "^5.0.0",
          "@radix-ui/themes": "latest",
        },
        main: "/index.js",
      }),
    },
    "/index.js": {
      code: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import '@radix-ui/themes/styles.css';

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Theme>
      <App />
    </Theme>
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

  // const submit = () => {
  //   const parameters = getParameters({ files });
  //   const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}&file=/App.js`;

  //   window.open(url, "_blank");
  // };

  if (!storySource) {
    return null;
  }

  const activeFile = "/App.js";

  const params = getFileParameters(files);
  const searchParams = new URLSearchParams({
    parameters: params,
    query: new URLSearchParams({
      file: activeFile,
      utm_medium: "storybook",
    }).toString(),
  });

  return (
    <Button
      key={TOOL_ID}
      disabled={!codesandboxParameters?.mapComponent}
      title={
        codesandboxParameters?.mapComponent
          ? "Open in CodeSandbox"
          : "Missing component mapping"
      }
      onClick={(): void => formRef.current?.submit()}
    >
      <form
        action={CSB_URL}
        method="POST"
        style={{ visibility: "hidden" }}
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
      <Icons icon="box" />
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
