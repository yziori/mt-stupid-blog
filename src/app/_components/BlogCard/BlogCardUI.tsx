import { formatToDotDate } from "@/app/_utils/dataUtils";

type Tag = {
	id: string;
	name: string;
};

type BlogCardUIProps = {
	id: string;
	title: string;
	thumbnail?: string;
	tags: Tag[];
	createdAt: string;
};

/**
 * BlogCardコンポーネントのUI部分
 */
export const BlogCardUI: React.FC<BlogCardUIProps> = ({
	id,
	title,
	thumbnail,
	tags,
	createdAt,
}) => {
	return (
		<div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer group">
			{/* 画像コンテナ */}
			<div className="aspect-video relative overflow-hidden">
				{thumbnail ? (
					<div className="w-full h-full relative">
						<img
							src={thumbnail}
							alt={title}
							width={800}
							height={450}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
						/>
						{/* 影をホバーで追加 */}
						<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
					</div>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
						No Image
					</div>
				)}
			</div>

			{/* テキスト部分 */}
			<div className="p-4">
				<div className="text-sm text-gray-500 mb-2">
					{formatToDotDate(createdAt)}
				</div>
				<h2 className="font-medium mb-3">{title}</h2>
				<div className="flex flex-wrap gap-2">
					{tags?.map((tag) => (
						<span
							key={`${id}-tag-${tag.id}`}
							className="text-xs bg-gray-100 px-2 py-1 rounded-full"
						>
							#{tag.name}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
