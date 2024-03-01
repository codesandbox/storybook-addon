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

  useEffect(() => {
    api
      .getChannel()
      .on(SNIPPET_RENDERED, ({ source }) => setStorySource(source));
  }, []);

  const files = {
    "/App.js": `
import Button from "./Button";

export default App = () => {
      return <div>${storySource}</div>;
  }`,
  };

  return (
    <IconButton key={TOOL_ID} title="Export to CodeSandbox">
      <Icons icon="lightning" />
    </IconButton>
  );
});
