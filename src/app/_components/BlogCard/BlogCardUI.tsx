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
		<div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
			<div
				className="aspect-video bg-gray-200"
				style={
					thumbnail
						? {
								backgroundImage: `url(${thumbnail})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}
						: undefined
				}
			/>
			<div className="p-4">
				<div className="text-sm text-gray-500 mb-2">{createdAt}</div>
				<h3 className="font-medium mb-3">{title}</h3>
				<div className="flex flex-wrap gap-2">
					{tags.slice(0, 3).map((tag) => (
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
