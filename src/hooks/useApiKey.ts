import { useState, useEffect } from 'react'

interface ApiKeys {
	scrapingBeeKey: string | null
	geminiApiKey: string | null
}

interface UseApiKeyReturn {
	scrapingBeeKey: string | null
	geminiApiKey: string | null
	setScrapingBeeKey: (key: string) => Promise<void>
	setGeminiApiKey: (key: string) => Promise<void>
	clearScrapingBeeKey: () => Promise<void>
	clearGeminiApiKey: () => Promise<void>
	isLoading: boolean
	error: string | null
}

export function useApiKey(): UseApiKeyReturn {
	const [scrapingBeeKey, setScrapingBeeKeyState] = useState<string | null>(
		null
	)
	const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Load API keys on mount
	useEffect(() => {
		loadApiKeys()
	}, [])

	const loadApiKeys = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const result = await browser.storage.local.get([
				'scrapingBeeKey',
				'geminiApiKey'
			])

			setScrapingBeeKeyState(result.scrapingBeeKey || null)
			setGeminiApiKeyState(result.geminiApiKey || null)

			console.log('✅ API keys loaded')
		} catch (err) {
			console.error('❌ Failed to load API keys:', err)
			setError(
				err instanceof Error ? err.message : 'Failed to load API keys'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const setScrapingBeeKey = async (key: string) => {
		try {
			setError(null)

			if (!key || key.trim().length < 10) {
				throw new Error('Invalid ScrapingBee API key format')
			}

			const trimmedKey = key.trim()
			await browser.storage.local.set({ scrapingBeeKey: trimmedKey })
			setScrapingBeeKeyState(trimmedKey)

			console.log('✅ ScrapingBee API key saved')
		} catch (err) {
			console.error('❌ Failed to save ScrapingBee API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to save ScrapingBee API key'
			)
			throw err
		}
	}

	const setGeminiApiKey = async (key: string) => {
		try {
			setError(null)

			if (!key || key.trim().length < 10) {
				throw new Error('Invalid Gemini API key format')
			}

			const trimmedKey = key.trim()
			await browser.storage.local.set({ geminiApiKey: trimmedKey })
			setGeminiApiKeyState(trimmedKey)

			console.log('✅ Gemini API key saved')
		} catch (err) {
			console.error('❌ Failed to save Gemini API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to save Gemini API key'
			)
			throw err
		}
	}

	const clearScrapingBeeKey = async () => {
		try {
			setError(null)
			await browser.storage.local.remove('scrapingBeeKey')
			setScrapingBeeKeyState(null)
			console.log('✅ ScrapingBee API key cleared')
		} catch (err) {
			console.error('❌ Failed to clear ScrapingBee API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to clear ScrapingBee API key'
			)
			throw err
		}
	}

	const clearGeminiApiKey = async () => {
		try {
			setError(null)
			await browser.storage.local.remove('geminiApiKey')
			setGeminiApiKeyState(null)
			console.log('✅ Gemini API key cleared')
		} catch (err) {
			console.error('❌ Failed to clear Gemini API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to clear Gemini API key'
			)
			throw err
		}
	}

	return {
		scrapingBeeKey,
		geminiApiKey,
		setScrapingBeeKey,
		setGeminiApiKey,
		clearScrapingBeeKey,
		clearGeminiApiKey,
		isLoading,
		error
	}
}
