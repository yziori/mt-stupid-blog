import { client } from "@/app/_libs/microcms";
import type { Tag } from "@/app/_libs/microcms/tags/types";
import { TagListUI } from "./TagListUI";

async function getTags(): Promise<Tag[]> {
	const data = await client.get({
		endpoint: "tags",
	});

	return data.contents;
}

export const TagListContainer: React.FC = async () => {
	const tags = await getTags();

	return <TagListUI tags={tags} />;
};
