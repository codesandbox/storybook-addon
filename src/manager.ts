import { addons, types } from "@storybook/manager-api";
import { ADDON_ID, TOOL_ID, PANEL_ID, TAB_ID } from "./constants";
import { Tool } from "./Tool";
import { Panel } from "./Panel";
import { Tab } from "./Tab";

/**
 * Note: if you want to use JSX in this file, rename it to `manager.tsx`
 * and update the entry prop in tsup.config.ts to use "src/manager.tsx",
 */

// Register the addon
addons.register(ADDON_ID, (...props) => {
  console.log(props);
  // Register the tool
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "My addon",
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: Tool,
  });
});
