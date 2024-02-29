import React from "react";

import type { Preview } from "@storybook/react";

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
  },
  decorators: [
    (Story, parms) => {
      console.log(parms);
      return (
        <div style={{ margin: "3em" }}>
          {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
