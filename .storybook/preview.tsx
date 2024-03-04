import React from "react";

import type { Preview } from "@storybook/react";
import { Theme } from "@radix-ui/themes";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    codesandbox: {
      /**
       * CodeSandbox workspace id where sandbox will be created.
       * @required
       */
      workspaceId: "foo",

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
