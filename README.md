<p align="center">
<img alt="Storybook CodeSandbox Addon" src="https://github.com/codesandbox/sandpack/assets/4838076/464ec018-48e5-410b-aaca-c050a3a02743" width="500" />
</p>

# Storybook CodeSandbox Addon

The `@codesandbox/storybook-addon` is a Storybook addon that facilitates exporting the current story to CodeSandbox. It offers support for private dependencies, workspaces, and more.

## Configuration

To run the addon, you'll need to configure it in your Storybook's `.storybook/preview.js` file.

```js
// .storybook/preview.js

codesandbox: {
  /**
   * CodeSandbox workspace id where the sandbox will be created.
   * @required
   */
  workspaceId: CUSTOM_WORKSPACE_ID,

  /**
   * List of dependencies to install in the sandbox
   * @optional
   * 
   * Example:
   */
  dependencies: {
    "@radix-ui/themes": "latest",
  },

  /**
   * All required providers to run the sandbox properly, such as
   * themes, i18n, store, and so on.
   * @optional
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
```

Make sure to provide the necessary values for workspaceId and any additional dependencies or providers required for your specific setup.

## Usage
Once configured, you can use the addon within your Storybook environment to export stories to CodeSandbox effortlessly.

## Additional Notes
- Ensure that you have proper permissions and access rights to the CodeSandbox workspace specified in the configuration.
- Verify the correctness of the dependencies and providers listed in the configuration to ensure the sandbox runs smoothly.