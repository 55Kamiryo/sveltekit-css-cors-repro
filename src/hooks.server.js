// `FIX=1 npm start` adds `crossorigin` to the SSR stylesheet links, i.e. the output of the proposed fix.
export async function handle({ event, resolve }) {
	if (!process.env.FIX) return resolve(event);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replaceAll('rel="stylesheet"', 'rel="stylesheet" crossorigin')
	});
}
