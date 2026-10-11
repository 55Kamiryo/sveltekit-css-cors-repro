// Serves build/client from another origin. Like some CDN setups, it sends
// Access-Control-Allow-Origin and Vary: Origin only when the request has an Origin header.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = join(import.meta.dirname, 'build/client');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

createServer(async (req, res) => {
	const path = new URL(req.url, 'http://x').pathname;
	const headers = { 'Cache-Control': 'public, max-age=1800' };
	if (req.headers.origin) {
		headers['Access-Control-Allow-Origin'] = '*';
		headers['Vary'] = 'Origin';
	}
	if (req.method === 'OPTIONS') {
		// CORS preflight, e.g. for SvelteKit's version check, which sends `cache-control`
		res.writeHead(204, { ...headers, 'Access-Control-Allow-Headers': '*' }).end();
		return;
	}
	try {
		const body = await readFile(join(root, path));
		headers['Content-Type'] = types[extname(path)] ?? 'application/octet-stream';
		res.writeHead(200, headers).end(body);
	} catch {
		res.writeHead(404, headers).end();
	}
}).listen(4174, '127.0.0.1');
