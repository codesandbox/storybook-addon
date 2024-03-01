import React, { memo, useCallback, useEffect, useState } from "react";
import {
  useArgs,
  useGlobals,
  useParameter,
  useStorybookApi,
} from "@storybook/manager-api";
import { Icons, IconButton } from "@storybook/components";
import { TOOL_ID } from "./constants";

const ADDON_ID = "storybook/docs";
const SNIPPET_RENDERED = `${ADDON_ID}/snippet-rendered`;

export const Tool = memo(function MyAddonSelector({ api }) {
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
    "/App.js": `
${imports}
export default App = () => {
  return ${storySource};
}`,
  };

  console.log(files);

  return (
    <IconButton key={TOOL_ID} title="Export to CodeSandbox">
      <Icons icon="lightning" />
    </IconButton>
  );
});
