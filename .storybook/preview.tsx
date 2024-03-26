import React from "react";

import type { Preview } from "@storybook/react";
import { Theme } from "@radix-ui/themes";

const preview: Preview = {
  parameters: {
    codesandbox: {
      /**
       * @required
       * Workspace API key from codesandbox.io/t/permissions.
       * This sandbox is created inside the given workspace
       * and can be shared with team members.
       */
      apiToken: import.meta.env.VITE_CSB_API_KEY,

      /**
       * List of dependencies to install in the sandbox
       * @optional
       */
      dependencies: {
        "@radix-ui/themes": "latest",
      },

      /**
       * All required providers to run the sandbox properly, such as
       * themes, i18n, store, and so on.
       * @optional
       */
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
