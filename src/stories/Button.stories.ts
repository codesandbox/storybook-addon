import type { Meta, StoryObj } from "@storybook/react";
import "@radix-ui/themes/styles.css";

import { Button } from "@radix-ui/themes";

const meta: Meta<typeof Button> = {
  title: "Example/Button",
  component: Button,
  argTypes: {
    variant: {
      options: ["classic", "soft", "outline"],
      control: { type: "radio" },
    },
    size: {
      options: ["1", "2", "3", "4"],
      control: { type: "radio" },
    },
  },
  parameters: {
    codesandbox: {
      mapComponent: {
        "@myscope/mypackage": "Provider",
        "@radix-ui/themes": ["Button"],
        "@radix-ui/themes/styles.css": true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "classic",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "soft",
    children: "Button",
  },
};

export const Large: Story = {
  args: {
    variant: "outline",
    size: "4",
    children: "Button",
  },
};
