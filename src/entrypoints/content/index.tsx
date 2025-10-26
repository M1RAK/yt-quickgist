import ReactDOM from 'react-dom/client'
import { ContentScriptContext } from '#imports'
import SidebarModal from '@/components/SidebarModal'
import '@/styles/globals.css'
import { extractVideoId, waitForSidebar } from '@/lib/utils'

const watchPattern = new MatchPattern('*://*.youtube.com/watch*')

// Store current UI instance globally to manage cleanup
let currentUi: any = null
let currentVideoId: string | null = null

export default defineContentScript({
	matches: ['*://*.youtube.com/*'],
	cssInjectionMode: 'ui',
	runAt: 'document_end',

	async main(ctx) {
		console.log('quickgist: Content script starting...')

		// Listen for URL changes (YouTube is a SPA)
		ctx.addEventListener(
			window,
			'wxt:locationchange',
			async ({ newUrl }) => {
				console.log('quickgist: Location changed to', newUrl)

				if (watchPattern.includes(newUrl)) {
					const videoId = extractVideoId(newUrl.toString())

					// Only remount if video ID changed
					if (videoId && videoId !== currentVideoId) {
						console.log('quickgist: New video detected:', videoId)
						unmountCurrentUi()
						mountUi(ctx, videoId)
					}
				} else {
					// Not a watch page, unmount UI
					console.log('quickgist: Left watch page, unmounting UI')
					unmountCurrentUi()
				}
			}
		)

		// Run on initial load
		if (watchPattern.includes(location.href)) {
			const videoId = extractVideoId(location.href)
			if (videoId) {
				console.log('quickgist: Initial mount for video:', videoId)
				mountUi(ctx, videoId)
			}
		}
	}
})

// Unmount and cleanup current UI
function unmountCurrentUi() {
	if (currentUi) {
		console.log('quickgist: Unmounting previous UI')
		try {
			currentUi.remove()
		} catch (e) {
			console.warn('quickgist: Error unmounting UI:', e)
		}
		currentUi = null
		currentVideoId = null
	}
}

async function mountUi(ctx: ContentScriptContext, videoId: string | null) {
	if (!videoId) return

	currentVideoId = videoId
	try {
		// Wait for the sidebar dynamically
		const sidebar = await waitForSidebar(
			'#columns #secondary, #fixed-columns-secondary #secondary'
		)

		const ui = await createShadowRootUi(ctx, {
			name: 'quickgist-sidebar-modal',
			position: 'inline',
			anchor: sidebar,
			append: 'first',
			onMount: (container: HTMLElement) => {
				console.log('quickgist: Mounting UI container')

				const wrapper = document.createElement('div')
				wrapper.id = 'quickgist-container'
        wrapper.style.marginBottom = '16px'
				container.prepend(wrapper)

				const root = ReactDOM.createRoot(wrapper)
				root.render(<SidebarModal videoId={videoId} />)
				return root
			},
			onRemove: (root) => root?.unmount()
		})
		ui.mount()
		currentUi = ui
		console.log('quickgist: UI mounted successfully for video:', videoId)
	} catch (error) {
		console.error('quickgist: Error mounting UI:', error)
	}
}
