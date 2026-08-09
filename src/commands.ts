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

export function queryParameter(value: string, parameter: string): SearchBuilder {
	const baseUrl = httpsUrl(value).href;

	return (query: string) => {
		const url = new URL(baseUrl);
		url.searchParams.set(parameter, query);
		return url;
	};
}

export function fragmentParameter(
	value: string,
	route: string,
	parameter: string,
): SearchBuilder {
	const baseUrl = httpsUrl(value).href;

	return (query: string) => {
		const url = new URL(baseUrl);
		url.hash = `${route}?${new URLSearchParams({ [parameter]: query })}`;
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
		const encodedQuery = options.preserveSlashes
			? query.split('/').map(encodeURIComponent).join('/')
			: encodeURIComponent(query);
		return new URL(`${baseUrl}${encodedQuery}`);
	};
}

export const config: Config = {
	default: {
		home: 'https://github.com/dwang/kittylol',
		search: queryParameter('https://google.com/search', 'q'),
	},
	commands: {
		cal: {
			home: 'https://calendar.google.com/',
		},
		cf: {
			home: 'https://dash.cloudflare.com/',
		},
		crt: {
			home: 'https://crt.sh/',
			search: queryParameter('https://crt.sh/', 'q'),
		},
		cs: {
			home: 'https://github.com/search',
			search: queryParameter('https://github.com/search?type=code', 'q'),
		},
		ctftime: {
			home: 'https://ctftime.org/',
		},
		cyberchef: {
			home: 'https://gchq.github.io/CyberChef/',
		},
		drive: {
			home: 'https://drive.google.com/',
			search: queryParameter('https://drive.google.com/drive/search', 'q'),
		},
		g: {
			home: 'https://google.com/',
			search: queryParameter('https://google.com/search', 'q'),
		},
		gcp: {
			home: 'https://console.cloud.google.com',
		},
		gh: {
			home: 'https://github.com/',
			search: path('https://github.com/', { preserveSlashes: true }),
		},
		gm: {
			home: 'https://mail.google.com/',
		},
		gpt: {
			home: 'https://chatgpt.com/',
			search: queryParameter('https://chatgpt.com/', 'q'),
		},
		hn: {
			home: 'https://news.ycombinator.com/',
			search: queryParameter('https://hn.algolia.com/', 'q'),
		},
		ip: {
			home: 'https://icanhazip.com/',
		},
		jwt: {
			home: 'https://jwt.io/',
			search: fragmentParameter('https://jwt.io/', 'debugger-io', 'token'),
		},
		maps: {
			home: 'https://www.google.com/maps',
			search: queryParameter('https://www.google.com/maps', 'q'),
		},
		time: {
			home: 'https://time.is/',
		},
		ts: {
			home: 'https://login.tailscale.com/admin/machines',
		},
		vt: {
			home: 'https://virustotal.com/',
			search: path('https://www.virustotal.com/gui/search/'),
		},
		yt: {
			home: 'https://www.youtube.com/',
			search: queryParameter('https://www.youtube.com/results', 'search_query'),
		},
	},
};
