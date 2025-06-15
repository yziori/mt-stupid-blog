import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from ".";

const meta: Meta<typeof Footer> = {
	title: "Features/Footer",
	component: Footer,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
	args: {},
};
