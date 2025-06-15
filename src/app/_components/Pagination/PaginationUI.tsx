import {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "../ui/pagination";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

/**
 * ページネーションコンポーネント
 * @param currentPage 現在のページ
 * @param totalPages 全ページ数
 * @param onPageChange ページ変更時のコールバック
 */
export const PaginationUI: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<Pagination>
			<PaginationContent>
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								onPageChange(currentPage - 1);
							}}
							className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
						/>
					</PaginationItem>
				)}

				{pages.map((page) => (
					<PaginationItem key={page}>
						<PaginationLink
							href="#"
							isActive={currentPage === page}
							onClick={(e) => {
								e.preventDefault();
								onPageChange(page);
							}}
							className={`w-8 h-8 flex items-center justify-center rounded-full ${
								currentPage === page
									? "bg-[#023474] text-white hover:bg-[#023474]/90 hover:text-white"
									: "hover:bg-gray-100"
							}`}
						>
							{page}
						</PaginationLink>
					</PaginationItem>
				))}

				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								onPageChange(currentPage + 1);
							}}
							className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
						/>
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
};
