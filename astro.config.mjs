import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
	site: 'https://mt-stupid.example.com', // TODO: 独自ドメイン設定時に差し替え
	output: 'static',
	trailingSlash: 'always',
	integrations: [react(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'vitesse-dark',
			wrap: false,
		},
		rehypePlugins: [
			rehypeSlug,
			[rehypeAutolinkHeadings, { behavior: 'wrap' }],
		],
	},
});
