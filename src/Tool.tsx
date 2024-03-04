import { getParameters } from "codesandbox/lib/api/define";
import React, { memo, useEffect, useState } from "react";
import { API, useParameter } from "@storybook/manager-api";
import { Icons, Button } from "@storybook/components";
import { TOOL_ID } from "./constants";

const ADDON_ID = "storybook/docs";
const SNIPPET_RENDERED = `${ADDON_ID}/snippet-rendered`;

export const Tool = memo(function MyAddonSelector({ api }: { api: API }) {
  const [storySource, setStorySource] = useState();
  const codesandboxParameters:
    | { mapComponent: Record<string, string[]> }
    | undefined = useParameter("codesandbox");

  useEffect(() => {
    api
      .getChannel()
      .on(SNIPPET_RENDERED, ({ source }) => setStorySource(source));
  }, []);

  if (!codesandboxParameters) {
    return null;
  }

  let imports = ``;
  for (const [key, value] of Object.entries(
    codesandboxParameters?.mapComponent ?? {},
  )) {
    imports += `import { ${value.join(", ")} } from '${key}';\n`;
  }

  const files = {
    "/package.json": {
      content: JSON.stringify({
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
      content: `import React, { StrictMode } from "react";
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
      content: `
${imports}
export default App = () => {
  return ${storySource};
}`,
    },
  };
  console.log(storySource);

  const submit = () => {
    const parameters = getParameters({ files, file: "/App.js" });
    const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;

    window.open(url, "_blank");
  };

  if (!storySource) {
    return null;
  }

  return (
    <Button key={TOOL_ID} title="Open in CodeSandbox" onClick={submit}>
      <Icons icon="box" />
      Open in CodeSandbox
    </Button>
  );
});
