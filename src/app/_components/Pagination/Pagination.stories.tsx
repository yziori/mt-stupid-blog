import type { Meta, StoryObj } from "@storybook/react";
import { fn, within, expect, userEvent } from "@storybook/test";
import { Pagination } from ".";
import { useState } from "react";

const meta: Meta<typeof Pagination> = {
	title: "Components/Pagination",
	component: Pagination,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
	args: {
		currentPage: 1,
		totalPages: 5,
		onPageChange: fn(),
	},
	render: (args) => {
		const [currentPage, setCurrentPage] = useState(args.currentPage);

		const handlePageChange = (newPage: number) => {
			setCurrentPage(newPage);
			args.onPageChange(newPage);
		};

		return (
			<Pagination
				{...args}
				currentPage={currentPage}
				onPageChange={handlePageChange}
			/>
		);
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step("ボタンの初期表示を確認", async () => {
			// 次ページボタンが表示されているか確認
			const nextButton = canvas.getByRole("link", { name: /next/i });
			expect(nextButton).toBeInTheDocument();

			// 前ページボタンが表示されていないか確認（初期ページは1）
			const prevButton = canvas.queryByRole("link", { name: /previous/i });
			expect(prevButton).not.toBeInTheDocument();

			// ページ1がアクティブか確認
			const page1Button = canvas.getByText("1");
			expect(page1Button.closest("a")).toHaveClass("bg-[#023474]");
		});

		await step("次のページへ移動", async () => {
			// 次のページボタンをクリック
			const nextButton = canvas.getByRole("link", { name: /next/i });
			await userEvent.click(nextButton);

			// ページ2がアクティブになったか確認
			const page2Button = canvas.getByText("2");
			expect(page2Button.closest("a")).toHaveClass("bg-[#023474]");

			// 前ページボタンが表示されるようになったか確認
			const prevButton = canvas.getByRole("link", { name: /previous/i });
			expect(prevButton).toBeInTheDocument();
		});

		await step("ページ番号をクリックして移動", async () => {
			// ページ4をクリック
			const page4Button = canvas.getByText("4");
			await userEvent.click(page4Button);

			// ページ4がアクティブになったか確認
			expect(page4Button.closest("a")).toHaveClass("bg-[#023474]");
		});

		await step("前のページへ移動", async () => {
			// 前のページボタンをクリック
			const prevButton = canvas.getByRole("link", { name: /previous/i });
			await userEvent.click(prevButton);

			// ページ3がアクティブになったか確認
			const page3Button = canvas.getByText("3");
			expect(page3Button.closest("a")).toHaveClass("bg-[#023474]");
		});

		await step("最終ページで次ページボタンが非表示", async () => {
			// ページ5（最終ページ）をクリック
			const page5Button = canvas.getByText("5");
			await userEvent.click(page5Button);

			// 次ページボタンが非表示になったか確認
			const nextButton = canvas.queryByRole("link", { name: /next/i });
			expect(nextButton).not.toBeInTheDocument();
		});
	},
};
