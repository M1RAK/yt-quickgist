import axios from 'axios'
import { GoogleGenAI } from '@google/genai'
import {
	checkAIAvailability,
	summarizeWithChromeAI,
	checkPromptAPIAvailability,
	summarizeWithPromptAPI
} from './chromeAI'

/**
 * Fetch YouTube transcript using ScrapingDog API
 */
export async function fetchTranscript(videoId: string): Promise<{
	videoId: string
	transcript: string
}> {
	console.log('🎬 fetchTranscript called for:', videoId)

	try {
		// Get API key
		const { scrapingDogKey: apiKey } = await browser.storage.local.get(
			'scrapingDogKey'
		)
		if (!apiKey) throw new Error('ScrapingDog API key not configured.')

		// Fetch transcript
		const url = 'https://api.scrapingdog.com/youtube/transcripts/'
		const { data, status } = await axios.get(url, {
			params: { api_key: apiKey, v: videoId }
		})

		if (status !== 200)
			throw new Error(`Request failed with status code: ${status}`)
		if (!data?.transcripts || !Array.isArray(data.transcripts))
			throw new Error('Invalid transcript data received.')

		// Combine transcript texts
		const transcript = data.transcripts
			.map((t: any) => t.text)
			.join(' ')
			.trim()

		if (!transcript) throw new Error('Transcript text empty.')

		console.log('✅ Transcript fetched successfully')
		return {
			videoId,
			transcript
		}
	} catch (err: any) {
		console.error('❌ Transcript fetch failed:', err)
		throw new Error(err.message || 'Failed to fetch transcript')
	}
}

/**
 * Generate summary using Chrome AI (Gemini Nano) with Gemini API fallback
 */
export async function fetchSummary(videoId: string): Promise<any> {
  
	const { settings } = await browser.storage.local.get('settings')
	const style = settings?.summaryStyle || 'bullet'
	const mode = settings?.summaryLength || 'medium'

	console.log('📝 fetchSummary called for:', videoId, 'mode:', mode)

	try {
		// First, get the transcript
		const transcriptData = await fetchTranscript(videoId)
		const transcript = transcriptData.transcript

		if (!transcript) {
			throw new Error('No transcript available')
		}

		console.log('📄 Transcript length:', transcript.length, 'characters')

		// Try Chrome AI first
		const chromeAIAvailable = await checkAIAvailability()

		if (chromeAIAvailable) {
			console.log('🤖 Using Chrome AI (Gemini Nano) for summarization...')

			try {
				// Map mode to Chrome AI options
				const lengthMap: Record<string, 'short' | 'medium' | 'long'> = {
					brief: 'short',
					detailed: 'long',
					actionable: 'medium'
				}

				const summary = await summarizeWithChromeAI(transcript, {
					type: style === 'paragraph' ? 'tl;dr' : 'key-points',
					format: 'markdown',
					length: lengthMap[mode] || 'medium'
				})

				return {
					videoId,
					mode,
					summary,
					source: 'chrome-ai'
				}
			} catch (chromeAIError) {
				console.warn(
					'⚠️ Chrome AI failed, trying Prompt API...',
					chromeAIError
				)

				// Try Prompt API as backup
				const promptAPIAvailable = await checkPromptAPIAvailability()

				if (promptAPIAvailable) {
					try {
						const summary = await summarizeWithPromptAPI(
							transcript,
							style,
							mode
						)
						return {
							videoId,
							mode,
							summary,
							source: 'prompt-api'
						}
					} catch (promptError) {
						console.warn(
							'⚠️ Prompt API failed, falling back to Gemini API...',
							promptError
						)
					}
				}
			}
		}

		// Fallback: Use Gemini API (only if configured)
		console.log('🔄 Falling back to Gemini API...')
		return await summarizeWithGemini(videoId, transcript, mode)
	} catch (err: any) {
		console.error('❌ Summary fetch failed:', err)
		return {
			success: false,
			error: err.message || 'Failed to generate summary'
		}
	}
}

/**
 * Fallback: Summarize using Gemini API (optional)
 */
export async function summarizeWithGemini(
	videoId: string,
	transcript: string,
	mode: 'brief' | 'detailed' | 'actionable'
): Promise<{
	videoId: string
	mode: string
	summary: string
	source: string
}> {
	try {
		// Retrieve Gemini API key
		const { geminiApiKey: apiKey } = await browser.storage.local.get(
			'geminiApiKey'
		)
		if (!apiKey)
			throw new Error(
				"Gemini API key not configured. Summaries require either Chrome's built-in AI or a Gemini API key."
			)

		// Initialize Gemini client
		const ai = new GoogleGenAI({ apiKey })

		// Select prompt template
		const prompts = {
			brief: 'Summarize this YouTube transcript in 3–5 concise bullet points:',
			detailed:
				'Summarize this YouTube transcript in 8–12 detailed bullet points with context and insights:',
			actionable:
				'Summarize this YouTube transcript in 5–8 bullet points focusing on actionable takeaways:'
		}
		const prompt = prompts[mode] ?? prompts.brief

		// Generate summary
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: `${prompt}\n\n${transcript.slice(
				0,
				30000
			)}\n\nReturn the summary in markdown in ${mode} format.
      Remove any introductory or redundant phrases that refer to the transcript or the video.
      Keep it focused purely on the content.`
		})

		// @ts-ignore
		const summary = response?.text.trim()

		if (!summary) throw new Error('Empty summary returned from Gemini API.')

		console.log('✅ Gemini API summary generated')

		return {
			videoId,
			mode,
			summary,
			source: 'gemini-api'
		}
	} catch (err: any) {
		console.error('❌ Gemini API summarization failed:', err)
		throw new Error(err.message || 'Gemini API summarization failed')
	}
}
