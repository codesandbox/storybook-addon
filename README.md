<p align="right">
<img alt="Storybook CodeSandbox Addon" src="https://github.com/codesandbox/sandpack/assets/4838076/464ec018-48e5-410b-aaca-c050a3a02743" width="350" />
</p>

# Storybook CodeSandbox Addon

The `@codesandbox/storybook-addon` is a Storybook addon that facilitates exporting the current story to CodeSandbox. It offers support for private dependencies, workspaces, and more.

## Usage

Once configured, you can use the "Open in CodeSandbox" button within your Storybook environment to export stories to CodeSandbox effortlessly.

## Configuration

<details>
  <summary>Storybook configuration (required)</summary>

<br />

To run the addon, you'll need to configure it in your Storybook's `.storybook/preview.js` file.

```js
// .storybook/preview.js
import { Theme } from "@radix-ui/themes";

const preview: Preview = {
  parameters: {
    codesandbox: {
      /**
       * @required
       * CodeSandbox workspace id where the sandbox will be created.
       */
      workspaceId: CUSTOM_WORKSPACE_ID,

      /**
       * @optional
       * Dependencies list be installed in the sandbox. 
       * 
       * @note You cannot use local modules or packages since
       * this story runs in an isolated environment (sandbox)
       * inside CodeSandbox. As such, the sandbox doesn't have
       * access to your file system.
       *
       * Example:
       */
      dependencies: {
        "@radix-ui/themes": "latest",
      },

      /**
       * @optional
       * All required providers to run the sandbox properly, 
       * such as themes, i18n, store, and so on.
       * 
       * @note Remember to use only the dependencies listed above. 
       * @example
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
};

export default preview;
```
</details>

<details>
  <summary>Story configuration (recommended)</summary>

```ts
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  title: "Example/Button",
  component: Button,
  parameters: {
    codesandbox: {
     /**
       * To import all components used within each story in 
       * CodeSandbox, provide all necessary packages and modules.
       * 
       * See example below:
       * ```js
       * import Provider from "@myscope/mypackage";
       * import { Button } from "@radix-ui/themes";
       * import "@radix-ui/themes/styles.css";
       * ```
       * 
       * @note You cannot use local modules or packages since
       * this story runs in an isolated environment (sandbox)
       * inside CodeSandbox. As such, the sandbox doesn't have
       * access to your file system.
       */
      mapComponent: {
        // Example of default imports
        "@myscope/mypackage": "Provider",

        // Example of named functions
        "@radix-ui/themes": ["Button"],

        // Example of static imports
        "@radix-ui/themes/styles.css": true,
      },
    },
  },
};
```

</details>

<br />

Make sure to provide the necessary values for workspaceId and any additional dependencies or providers required for your specific setup.

## Additional Notes
- Ensure that you have proper permissions and access rights to the CodeSandbox workspace specified in the configuration.
- Verify the correctness of the dependencies and providers listed in the configuration to ensure the sandbox runs smoothly.