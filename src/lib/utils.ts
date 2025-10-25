function extractVideoId(url: string): string | null {
	const match = url.match(/[?&]v=([^&]+)/)
	return match ? match[1] : null
}

/**
 * Wait for the YouTube sidebar (#secondary) to exist.
 * Resolves with the element once it's found.
 * If removed later, your observer in mountUi should handle remounting.
 */
function waitForSidebar(selector = '#secondary'): Promise<HTMLElement> {
	return new Promise((resolve) => {
		// If already present, resolve immediately
		const existing = document.querySelector(selector)
		if (existing) return resolve(existing as HTMLElement)

		// Otherwise observe DOM mutations
		const observer = new MutationObserver(() => {
			const el = document.querySelector(selector)
			if (el) {
				observer.disconnect()
				resolve(el as HTMLElement)
			}
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true
		})
	})
}

export { waitForSidebar, extractVideoId }
