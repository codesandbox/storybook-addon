import React, { memo, useEffect, useState } from "react";
import { API, useParameter, useStorybookApi } from "@storybook/manager-api";
import { BoxIcon } from "@storybook/icons";
import { IconButton } from "@storybook/components";

import { TOOL_ID } from "./constants";
import { convertSandboxToTemplate, parseImports } from "./utils";

const SNIPPET_RENDERED = `storybook/docs/snippet-rendered`;

export type CSBParameters =
  | {
      apiToken: string;
      mapComponent?: Record<string, string[] | string | true>;
      dependencies?: Record<string, string>;
      provider?: string;
      template?: "react" | "angular";
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
    template: codesandboxParameters?.template ?? "react",
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

      const files = await convertSandboxToTemplate({
        ...options,
        imports: parseImports(options.mapComponent),
        storySource,
      });

      console.log(codesandboxParameters);

      debugger;

      if (!codesandboxParameters.apiToken) {
        throw new Error("Missing `apiToken` property");
      }

      const response = await fetch("https://api.codesandbox.io/sandbox", {
        method: "POST",
        body: JSON.stringify({
          title: `${storyData.title} - Storybook`,
          files,
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
