import type { Meta, StoryObj } from "@storybook/react";
import { BlogCard } from ".";

const meta: Meta<typeof BlogCard> = {
	title: "Components/BlogCard",
	component: BlogCard,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Default: Story = {
	args: {
		id: "1",
		title: "Sample Blog Post",
		thumbnail: "https://placehold.co/600x400",
		tags: [
			{ id: "1", name: "React" },
			{ id: "2", name: "TypeScript" },
			{ id: "3", name: "TailwindCSS" },
		],
		createdAt: "2025-03-21",
	},
};

export const WithImage: Story = {
	args: {
		id: "2",
		title: "Another Blog Post",
		tags: [
			{ id: "1", name: "JavaScript" },
			{ id: "2", name: "CSS" },
		],
		createdAt: "2025-03-20",
	},
};

export const Featured: Story = {
	args: {
		...Default.args,
	},
};
