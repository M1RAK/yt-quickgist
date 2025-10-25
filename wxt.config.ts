import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/module-react'],
	srcDir: 'src',
	manifest: ({ browser, manifestVersion, mode, command }) => {
		return {
			name: 'QuickGist',
			description:
				'AI-powered YouTube video summarizer using Chrome Built-in AI',
			version: '1.0.0',
			permissions: ['storage', 'activeTab'],
			host_permissions: ['*://*.youtube.com/*', '*://api.scrapingdog.com/*'],
		}
	}
})
