import { useState, useEffect } from 'react'

interface ApiKeys {
	scrapingDogKey: string | null
	geminiApiKey: string | null
}

interface UseApiKeyReturn {
	scrapingDogKey: string | null
	geminiApiKey: string | null
	setScrapingDogKey: (key: string) => Promise<void>
	setGeminiApiKey: (key: string) => Promise<void>
	clearScrapingDogKey: () => Promise<void>
	clearGeminiApiKey: () => Promise<void>
	isLoading: boolean
	error: string | null
}

export function useApiKey(): UseApiKeyReturn {
	const [scrapingDogKey, setScrapingDogKeyState] = useState<string | null>(
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
				'scrapingDogKey',
				'geminiApiKey'
			])

			setScrapingDogKeyState(result.scrapingDogKey || null)
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

	const setScrapingDogKey = async (key: string) => {
		try {
			setError(null)

			if (!key || key.trim().length < 10) {
				throw new Error('Invalid ScrapingDog API key format')
			}

			const trimmedKey = key.trim()
			await browser.storage.local.set({ scrapingDogKey: trimmedKey })
			setScrapingDogKeyState(trimmedKey)

			console.log('✅ ScrapingDog API key saved')
		} catch (err) {
			console.error('❌ Failed to save ScrapingDog API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to save ScrapingDog API key'
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

	const clearScrapingDogKey = async () => {
		try {
			setError(null)
			await browser.storage.local.remove('scrapingDogKey')
			setScrapingDogKeyState(null)
			console.log('✅ ScrapingDog API key cleared')
		} catch (err) {
			console.error('❌ Failed to clear ScrapingDog API key:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to clear ScrapingDog API key'
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
		scrapingDogKey,
		geminiApiKey,
		setScrapingDogKey,
		setGeminiApiKey,
		clearScrapingDogKey,
		clearGeminiApiKey,
		isLoading,
		error
	}
}
