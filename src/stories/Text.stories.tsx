import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import "@radix-ui/themes/styles.css";

import { Text } from "@radix-ui/themes";

const meta: Meta<typeof Text> = {
  component: Text,
  argTypes: {
    size: {
      options: ["1", "2", "3", "4"],
      control: { type: "radio" },
    },
  },
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
};

export const Base: StoryObj = {};

export const Small: StoryObj = {
  args: {
    size: "1",
  },
  parameters: {
    codesandbox: {
      mapComponent: {
        "@radix-ui/themes": ["Button"],
        "@radix-ui/themes/styles.css": true,
      },
    },
  },
};

export default meta;
