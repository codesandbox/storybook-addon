import React, { memo, useCallback, useEffect, useState } from "react";
import {
  useGlobals,
  useParameter,
  useStorybookApi,
} from "@storybook/manager-api";
import { Icons, IconButton } from "@storybook/components";
import { TOOL_ID } from "./constants";

const ADDON_ID = "storybook/docs";
const SNIPPET_RENDERED = `${ADDON_ID}/snippet-rendered`;

export const Tool = memo(function MyAddonSelector() {
  const api = useStorybookApi();
  const [storySource, setStorySource] = useState();
  const story = api.getCurrentStoryData();

  console.log(story);

  useEffect(() => {
    api
      .getChannel()
      .on(SNIPPET_RENDERED, ({ source }) => setStorySource(source));
  }, []);

  const files = {
    "/App.js": `export default App = () => {
    return <div>${storySource}</div>;
}`,
  };

  return (
    <IconButton key={TOOL_ID} title="Enable my addon">
      <Icons icon="lightning" />
    </IconButton>
  );
});
