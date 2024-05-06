<p align="right">
<img alt="Storybook CodeSandbox Addon" src="https://github.com/codesandbox/sandpack/assets/4838076/464ec018-48e5-410b-aaca-c050a3a02743" width="350" />
</p>

# Storybook CodeSandbox Addon

[![Edit in CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/github/codesandbox/storybook-addon)

The `@codesandbox/storybook-addon` is a Storybook addon that allows users accessing a story-book page to export the code from the story as a CodeSandbox Sandbox.
Sandboxes will always be created within the same workspace providing a closed-circuit feedback system. The add-on also provides support for private dependencies.

## Usage

Once configured, you can use the "Open in CodeSandbox" button within your Storybook environment to export stories to CodeSandbox effortlessly.

## Configuration

```js
// .storybook/main.js

module.exports = {
  // ...
  addons: ["@codesandbox/storybook-addon"],
};
```

<details>
  <summary>Storybook configuration (required)</summary>

<br />

To run the addon, you'll need to configure it in your Storybook's `.storybook/preview.js` file.

```js
// .storybook/preview.js

const preview: Preview = {
  parameters: {
    codesandbox: {
      /**
       * @required
       * Workspace API key from codesandbox.io/t/permissions.
       * This sandbox is created inside the given workspace
       * and can be shared with team members.
       */
      apiToken: <api-token>,

      /**
       * @required
       * The default visibility of the new sandboxes inside the workspace.
       *
       * @note Use `private` if there is a private registry or private NPM
       * configured in your workspace.
       */
      privacy: "private" | "public",

      /**
       * @required
       * Dependencies list to be installed in the sandbox.
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
        "@myscope/mypackage": "1.0.0",
      },

      /**
       * @required
       * CodeSandbox will try to import all components by default from
       * the given package, in case `mapComponent` property is not provided.
       *
       * This property is useful when your components imports are predictable
       * and come from a single package and entry point.
       */
      fallbackImport: "@radix-ui/themes",

      /**
       * @optional
       * All required providers to run the sandbox properly,
       * such as themes, i18n, store, and so on.
       *
       * @note Remember to use only the dependencies listed above.
       *
       * Example:
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

````ts
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
       * Given the following story:
       * ```js
       * import Provider from "@myscope/mypackage";
       * import { Button } from "@radix-ui/themes";
       * import "@radix-ui/themes/styles.css";
       * ```
       *
       * You need to map all imports to the following:
       */
      mapComponent: {
        // Example of default imports
        "@myscope/mypackage": "Provider",

        // Example of named functions
        "@radix-ui/themes": ["Button"],

        // Example of static imports
        "@radix-ui/themes/styles.css": true,
      },

      /**
       * @note You cannot use local modules or packages since
       * this story runs in an isolated environment (sandbox)
       * inside CodeSandbox. As such, the sandbox doesn't have
       * access to your file system.
       */
    },
  },
};
````

</details>

<br />

Make sure to provide the necessary values for [`apiToken`](https://codesandbox.io/t/permissions) and any additional dependencies or providers required for your specific setup.

For now, this addon only support [Component Story Format (CSF)](Component Story Format (CSF)) stories format.

## Additional Notes

- Ensure that you have proper permissions and access rights to the CodeSandbox workspace specified in the configuration.
- Verify the correctness of the dependencies and providers listed in the configuration to ensure the sandbox runs smoothly.

## Roadmap

- [ ] Suppport TypeScript
- [ ] Introduce more templates support (static, vue, angular...)
