import { fetchTranscript, fetchSummary } from '@/lib/services'
import {
	getCachedTranscript,
	setCachedTranscript,
	getCachedSummary,
	setCachedSummary
} from '@/lib/storage'

export default defineBackground(() => {
	console.log('🚀 QuickGist background script loaded!')

	// Message router
	browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		;(async () => {
			try {
				switch (message.action) {
					case 'getTranscript': {
						console.log(
							'📨 Message: getTranscript for',
							message.videoId
						)
						const { videoId } = message

						// Check cache first
						const cached = await getCachedTranscript(videoId)
						if (cached) {
							console.log('✅ Returning cached transcript')
							sendResponse({
								success: true,
								data: {
									transcript: cached.transcript,
									videoId: cached.videoId,
									cached: true
								}
							})
							break
						}

						// Fetch from API
						const response = await fetchTranscript(videoId)

						if (response && response.transcript) {
							// Cache the result
							await setCachedTranscript(videoId, response)

							sendResponse({
								success: true,
								data: {
									transcript: response.transcript,
									videoId: response.videoId,
									cached: false
								}
							})
						} else {
							sendResponse({
								success: false,
								error: 'Transcript not available'
							})
						}
						break
					}

					case 'getSummary': {
						console.log(
							'📨 Message: getSummary for',
							message.videoId
						)
						const { videoId, mode = 'brief' } = message

						// Check cache first
						const cached = await getCachedSummary(videoId, mode)
						if (cached) {
							console.log('✅ Returning cached summary')
							sendResponse({
								success: true,
								data: {
									summary: cached.summary,
									videoId: cached.videoId,
									mode: cached.mode,
									source: cached.source,
									cached: true
								}
							})
							break
						}

						// Generate new summary
						const response = await fetchSummary(videoId, mode)

						if (response && response.summary) {
							// Cache the result
							await setCachedSummary(videoId, mode, response)

							sendResponse({
								success: true,
								data: {
									summary: response.summary,
									videoId: response.videoId,
									mode: response.mode,
									source: response.source,
									cached: false
								}
							})
						} else {
							sendResponse({
								success: false,
								error:
									response?.error || 'Summary not available'
							})
						}
						break
					}

					default:
						console.warn(
							'⚠️ Unknown message action:',
							message.action
						)
						sendResponse({
							success: false,
							error: 'Unknown action'
						})
				}
			} catch (error) {
				console.error('❌ Message handler error:', error)
				sendResponse({
					success: false,
					error:
						error instanceof Error ? error.message : 'Unknown error'
				})
			}
		})()

		return true // Keep channel open for async response
	})
})
