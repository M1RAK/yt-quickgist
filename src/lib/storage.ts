/**
 * Storage utilities using chrome.storage.local
 * Replaces localStorage for better extension compatibility
 */

// Default TTL = 24 hours (in ms)
const DEFAULT_TTL = 24 * 60 * 60 * 1000

interface CacheEntry<T> {
	data: T
	timestamp: number
}

interface TranscriptCache {
	[videoId: string]: CacheEntry<any>
}

interface SummaryCache {
	[key: string]: CacheEntry<any> // key format: videoId:mode
}

/**
 * Get cached transcript
 */
export async function getCachedTranscript(
	videoId: string
): Promise<any | null> {
	try {
		const result = await browser.storage.local.get('transcriptCache')
		const cache: TranscriptCache = result.transcriptCache || {}
		const entry = cache[videoId]

		if (!entry) {
			console.log('📦 No cached transcript for:', videoId)
			return null
		}

		const { data, timestamp } = entry

		// Check expiry
		if (Date.now() - timestamp > DEFAULT_TTL) {
			console.log('⏰ Transcript cache expired for:', videoId)
			delete cache[videoId]
			await browser.storage.local.set({ transcriptCache: cache })
			return null
		}

		console.log('✅ Using cached transcript for:', videoId)
		return data
	} catch (err) {
		console.error('❌ Error reading transcript cache:', err)
		return null
	}
}

/**
 * Set cached transcript
 */
export async function setCachedTranscript(
	videoId: string,
	data: any
): Promise<void> {
	try {
		const result = await browser.storage.local.get('transcriptCache')
		const cache: TranscriptCache = result.transcriptCache || {}

		cache[videoId] = {
			data,
			timestamp: Date.now()
		}

		await browser.storage.local.set({ transcriptCache: cache })
		console.log('💾 Transcript cached for:', videoId)
	} catch (err) {
		console.error('❌ Error caching transcript:', err)
	}
}

/**
 * Get cached summary
 */
export async function getCachedSummary(
	videoId: string,
	mode: string = 'brief'
): Promise<any | null> {
	try {
		const result = await browser.storage.local.get('summaryCache')
		const cache: SummaryCache = result.summaryCache || {}
		const cacheKey = `${videoId}:${mode}`
		const entry = cache[cacheKey]

		if (!entry) {
			console.log('📦 No cached summary for:', cacheKey)
			return null
		}

		const { data, timestamp } = entry

		// Check expiry
		if (Date.now() - timestamp > DEFAULT_TTL) {
			console.log('⏰ Summary cache expired for:', cacheKey)
			delete cache[cacheKey]
			await browser.storage.local.set({ summaryCache: cache })
			return null
		}

		console.log('✅ Using cached summary for:', cacheKey)
		return data
	} catch (err) {
		console.error('❌ Error reading summary cache:', err)
		return null
	}
}

/**
 * Set cached summary
 */
export async function setCachedSummary(
	videoId: string,
	mode: string,
	data: any
): Promise<void> {
	try {
		const result = await browser.storage.local.get('summaryCache')
		const cache: SummaryCache = result.summaryCache || {}
		const cacheKey = `${videoId}:${mode}`

		cache[cacheKey] = {
			data,
			timestamp: Date.now()
		}

		await browser.storage.local.set({ summaryCache: cache })
		console.log('💾 Summary cached for:', cacheKey)
	} catch (err) {
		console.error('❌ Error caching summary:', err)
	}
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
	try {
		await browser.storage.local.remove(['transcriptCache', 'summaryCache'])
		console.log('🗑️ All cache cleared')
	} catch (err) {
		console.error('❌ Error clearing cache:', err)
	}
}

/**
 * Get cache size info
 */
export async function getCacheInfo(): Promise<{
	transcripts: number
	summaries: number
}> {
	try {
		const result = await browser.storage.local.get([
			'transcriptCache',
			'summaryCache'
		])
		const transcriptCache: TranscriptCache = result.transcriptCache || {}
		const summaryCache: SummaryCache = result.summaryCache || {}

		return {
			transcripts: Object.keys(transcriptCache).length,
			summaries: Object.keys(summaryCache).length
		}
	} catch (err) {
		console.error('❌ Error getting cache info:', err)
		return { transcripts: 0, summaries: 0 }
	}
}
