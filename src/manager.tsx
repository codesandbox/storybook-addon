import React from "react";
import { addons, types } from "@storybook/manager-api";
import { ADDON_ID, TOOL_ID } from "./constants";
import { CodeSandboxTool } from "./Tool";

addons.register(ADDON_ID, (api) => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "CodeSandbox",
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => <CodeSandboxTool api={api} />,
  });
});
