export type SearchBuilder = (query: string) => URL;

export interface Command {
	readonly home: string;
	readonly search?: SearchBuilder;
}

interface Config {
	readonly default: Command & { readonly search: SearchBuilder };
	readonly commands: Readonly<Record<string, Command>>;
}

interface PathOptions {
	readonly preserveSlashes?: boolean;
}

function httpsUrl(value: string): URL {
	const url = new URL(value);
	if (url.protocol !== 'https:') {
		throw new TypeError(`Command URLs must use HTTPS: ${value}`);
	}
	return url;
}

export function defineConfig(value: Config): Config {
	httpsUrl(value.default.home);
	for (const command of Object.values(value.commands)) {
		httpsUrl(command.home);
	}
	return value;
}

export function queryParameter(value: string, parameter: string): SearchBuilder {
	const baseUrl = httpsUrl(value).href;

	return (query: string) => {
		const url = new URL(baseUrl);
		url.searchParams.set(parameter, query);
		return url;
	};
}

export function path(value: string, options: PathOptions = {}): SearchBuilder {
	const url = httpsUrl(value);
	if (url.search || url.hash) {
		throw new TypeError(`Path command URLs cannot contain a query or fragment: ${value}`);
	}
	if (!url.pathname.endsWith('/')) {
		url.pathname += '/';
	}
	const baseUrl = url.href;

	return (query: string) => {
		if (options.preserveSlashes) {
			const encodedSegments = query
				.split('/')
				.filter((segment) => segment !== '' && segment !== '.' && segment !== '..')
				.map(encodeURIComponent)
				.join('/');
			return new URL(`${baseUrl}${encodedSegments}`);
		}

		if (query === '.' || query === '..') {
			return new URL(baseUrl);
		}

		return new URL(`${baseUrl}${encodeURIComponent(query)}`);
	};
}

const githubIssuePattern = /^([^/?#\s]+)\/([^/?#\s]+)#(\d+)$/;

function github(): SearchBuilder {
	const search = queryParameter('https://github.com/search', 'q');
	const repoPath = path('https://github.com/', { preserveSlashes: true });

	return (query: string) => {
		if (/\s/.test(query)) {
			return search(query);
		}

		const normalized = query.replace(/^\/+/, '');
		const match = githubIssuePattern.exec(normalized);
		if (match) {
			const [, owner, repo, issueNumber] = match;
			if (owner && repo && issueNumber && owner !== '.' && owner !== '..' && repo !== '.' && repo !== '..') {
				return new URL(`https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`);
			}
		}

		return repoPath(query);
	};
}

export const config: Config = defineConfig({
	default: {
		home: 'https://github.com/dwang/kittylol',
		search: queryParameter('https://www.google.com/search', 'q'),
	},
	commands: {
		cal: {
			home: 'https://calendar.google.com/',
		},
		cf: {
			home: 'https://dash.cloudflare.com/',
		},
		cs: {
			home: 'https://github.com/search',
			search: queryParameter('https://github.com/search?type=code', 'q'),
		},
		docker: {
			home: 'https://hub.docker.com/',
			search: queryParameter('https://hub.docker.com/search', 'q'),
		},
		drive: {
			home: 'https://drive.google.com/',
			search: queryParameter('https://drive.google.com/drive/search', 'q'),
		},
		g: {
			home: 'https://www.google.com/',
			search: queryParameter('https://www.google.com/search', 'q'),
		},
		gcp: {
			home: 'https://console.cloud.google.com/',
		},
		gh: {
			home: 'https://github.com/',
			search: github(),
		},
		gm: {
			home: 'https://mail.google.com/',
		},
		hn: {
			home: 'https://news.ycombinator.com/',
			search: queryParameter('https://hn.algolia.com/', 'q'),
		},
		ip: {
			home: 'https://icanhazip.com/',
		},
		maps: {
			home: 'https://www.google.com/maps',
			search: queryParameter('https://www.google.com/maps', 'q'),
		},
		ts: {
			home: 'https://login.tailscale.com/admin/machines',
		},
		yt: {
			home: 'https://www.youtube.com/',
			search: queryParameter('https://www.youtube.com/results', 'search_query'),
		},
	},
});
