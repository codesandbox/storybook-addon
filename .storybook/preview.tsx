import React from "react";

import type { Preview } from "@storybook/react";
import { Theme } from "@radix-ui/themes";

const preview: Preview = {
  parameters: {
    codesandbox: {
      apiToken: import.meta.env.VITE_CSB_API_KEY,

      fallbackImport: "@radix-ui/themes",

      privacy: "public",

      dependencies: {
        "@radix-ui/themes": "latest",
      },

      provider: `import { Theme } from "@radix-ui/themes";
import '@radix-ui/themes/styles.css';

export default ThemeProvider = ({ children }) => {
  return (
    <Theme>
      {children}
    </Theme>
  ) 
}`,
    },
  },
  decorators: [
    (Story) => (
      <Theme>
        <Story />
      </Theme>
    ),
  ],
};

export default preview;
