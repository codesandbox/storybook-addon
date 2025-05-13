import React, { memo, useEffect, useState } from "react";
import { API, useParameter, useStorybookApi } from "@storybook/manager-api";
import { BoxIcon } from "@storybook/icons";
import { IconButton } from "@storybook/components";

import { TOOL_ID } from "./constants";
import { convertSandboxToTemplate, parseFileTree, parseImports } from "./utils";
const SNIPPET_RENDERED = `storybook/docs/snippet-rendered`;

export type CSBParameters =
  | {
      apiToken: string;
      privacy?: "private" | "public";
      fallbackImport?: string;
      mapComponent?: Record<string, string[] | string | true>;
      dependencies?: Record<string, string>;
      provider?: string;
      sandboxId: string;
      files: Record<string, string>;
      template?: "react" | "angular";
      queryParams?: Record<string, string>;
    }
  | undefined;

function createUrl(
  sandboxId: string,
  queryParams: Record<string, string>,
): URL {
  const url = new URL(`https://codesandbox.io/p/sandbox/${sandboxId}`);
  url.searchParams.set("file", "/src/App.js");
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("utm-source", "storybook-addon");
  return url;
}

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
    files: codesandboxParameters?.files ?? {},
    apiToken: codesandboxParameters?.apiToken,
    sandboxId: codesandboxParameters?.sandboxId,
    queryParams: codesandboxParameters?.queryParams ?? {},
  };

  async function createSandbox() {
    try {
      if (options.sandboxId) {
        window.open(
          createUrl(options.sandboxId, options.queryParams).toString(),
          "_blank",
        );

        return;
      }

      setLoading(true);

      const { fallbackImport } = codesandboxParameters;
      const importsMap = options.mapComponent;

      // If fallbackImport is provided, add it to importsMap
      if (fallbackImport) {
        const componentNames = parseFileTree(storySource);

        // Check if fallbackImport is already in importsMap
        if (importsMap[fallbackImport]) {
          const currentFallbackImport = importsMap[fallbackImport];

          // Merge them
          if (Array.isArray(currentFallbackImport)) {
            importsMap[fallbackImport] = [
              ...new Set([...componentNames, ...currentFallbackImport]),
            ];
          } else {
            // Invalid use case
            throw new Error(
              "Invalid fallback import usage. The `import` used inside `mapComponent` and also used as `fallbackImport` must be an array.",
            );
          }
        } else {
          // Just added (0-config case)
          importsMap[fallbackImport] = componentNames;
        }
      }

      const imports = parseImports(importsMap);

      const files = await convertSandboxToTemplate({
        ...options,
        imports,
        storySource,
      });

      if (!codesandboxParameters.apiToken) {
        throw new Error("Missing `apiToken` property");
      }

      const response = await fetch("https://api.codesandbox.io/sandbox", {
        method: "POST",
        body: JSON.stringify({
          title: `${storyData.title} - Storybook`,
          files,
          privacy: codesandboxParameters.privacy === "public" ? 0 : 2,
        }),
        headers: {
          Authorization: `Bearer ${codesandboxParameters.apiToken}`,
          "Content-Type": "application/json",
          "X-CSB-API-Version": "2023-07-01",
        },
      });

      const data: { data: { alias: string } } = await response.json();

      window.open(
        createUrl(data.data.alias, options.queryParams).toString(),
        "_blank",
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);

      addNotification({
        content: {
          headline: "CodeSandbox: something went wrong",
          subHeadline:
            "Make sure you have a valid API token, or check the console for more details.",
        },
        id: "csb-error",
        link: "",
      });

      console.error(error.message);

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
