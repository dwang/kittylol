import config from '../config.json';

interface CommandConfig {
	baseUrl: string;
	searchUrlTemplate?: string;
}

export default {
	async fetch(request: Request): Promise<Response> {
		const { default: defaultConfig, commands } = config as {
			default: {
				baseUrl: string;
				searchUrlTemplate: string;
			};
			commands: Record<string, CommandConfig>;
		};

		const requestUrl = new URL(request.url);
		const rawQuery = requestUrl.searchParams.get('q')?.trim();

		if (!rawQuery) {
			return Response.redirect(defaultConfig.baseUrl, 302);
		}

		const [rawCommand, ...queryParts] = rawQuery.split(/\s+/);
		const command = rawCommand.toLowerCase();
		const queryString = queryParts.join(' ');

		const commandConfig = commands[command];
		if (!commandConfig) {
			const encodedQuery = encodeURIComponent(rawQuery);
			const defaultSearchUrl = defaultConfig.searchUrlTemplate.replace('{query}', encodedQuery);
			return Response.redirect(defaultSearchUrl, 302);
		}

		if (!queryString || !commandConfig.searchUrlTemplate) {
			return Response.redirect(commandConfig.baseUrl, 302);
		}

		const searchUrlObj = new URL(commandConfig.searchUrlTemplate);
		const shouldEncodeQuery = searchUrlObj.search.length > 0;
		const processedQuery = shouldEncodeQuery ? encodeURIComponent(queryString) : queryString;
		const redirectUrl = commandConfig.searchUrlTemplate.replace('{query}', processedQuery);
		return Response.redirect(redirectUrl, 302);
	},
} satisfies ExportedHandler;
