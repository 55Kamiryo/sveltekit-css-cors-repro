import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			// the app runs on 127.0.0.1:3000, assets are served by cdn.mjs on another origin
			paths: { assets: 'http://127.0.0.1:4174' }
		})
	]
});
