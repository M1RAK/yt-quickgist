/**
 * Chrome Built-in AI APIs Integration
 * Uses Gemini Nano running locally in the browser
 */

interface SummarizeOptions {
	type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline'
	format?: 'plain-text' | 'markdown'
	length?: 'short' | 'medium' | 'long'
}

interface AICapabilities {
	available: 'readily' | 'after-download' | 'no'
	supportsLanguage?: (
		lang: string
	) => Promise<'readily' | 'after-download' | 'no'>
}

// Check if Chrome AI is available
export async function checkAIAvailability(): Promise<boolean> {
	try {
		// @ts-ignore - Chrome AI APIs are experimental
		if (!window.ai || !window.ai.summarizer) {
			console.log('❌ Chrome AI Summarizer API not available')
			return false
		}

		const capabilities: AICapabilities =
			// @ts-ignore
			await window.ai.summarizer.capabilities()

		if (capabilities.available === 'no') {
			console.log('❌ Summarizer not available on this device')
			return false
		}

		if (capabilities.available === 'after-download') {
			console.log('⏳ Summarizer available after model download')
			return true
		}

		console.log('✅ Chrome AI Summarizer ready')
		return true
	} catch (err) {
		console.error('❌ Error checking AI availability:', err)
		return false
	}
}

// Summarize text using Chrome AI
export async function summarizeWithChromeAI(
	text: string,
	options: SummarizeOptions = {}
): Promise<string> {
	try {
		// @ts-ignore
		if (!window.ai || !window.ai.summarizer) {
			throw new Error('Chrome AI not available')
		}

		const {
			type = 'key-points',
			format = 'markdown',
			length = 'medium'
		} = options

		console.log('🤖 Creating Chrome AI summarizer...')

		// @ts-ignore
		const summarizer = await window.ai.summarizer.create({
			type,
			format,
			length
		})

		console.log('📝 Generating summary with Chrome AI...')
		const summary = await summarizer.summarize(text)

		// Cleanup
		summarizer.destroy()

		console.log(
			'✅ Chrome AI summary generated:',
			summary.substring(0, 100) + '...'
		)
		return summary
	} catch (err) {
		console.error('❌ Chrome AI summarization failed:', err)
		throw err
	}
}

// Check if Prompt API is available (for fallback)
export async function checkPromptAPIAvailability(): Promise<boolean> {
	try {
		// @ts-ignore
		if (!window.ai || !window.ai.languageModel) {
			return false
		}

		// @ts-ignore
		const capabilities = await window.ai.languageModel.capabilities()
		return capabilities.available !== 'no'
	} catch (err) {
		console.error('Error checking Prompt API:', err)
		return false
	}
}

// Summarize using Prompt API (alternative if Summarizer API unavailable)
export async function summarizeWithPromptAPI(
	text: string,
	style: string = 'bullet',
	length: string = 'medium'
): Promise<string> {
	try {
		// @ts-ignore
		if (!window.ai || !window.ai.languageModel) {
			throw new Error('Prompt API not available')
		}

		console.log('🤖 Creating Prompt API session...')

		// @ts-ignore
		const session = await window.ai.languageModel.create({
			systemPrompt:
				'You are a helpful assistant that summarizes YouTube video transcripts.'
		})

		const lengthInstructions = {
			short: '3-5 key points',
			medium: '5-8 key points',
			long: '8-12 key points'
		}

		const styleInstructions = {
			bullet: 'as bullet points',
			paragraph: 'as flowing paragraphs',
			detailed: 'with detailed analysis and context'
		}

		const prompt = `Summarize this YouTube video transcript ${
			styleInstructions[style as keyof typeof styleInstructions] ||
			'as bullet points'
		}, providing ${
			lengthInstructions[length as keyof typeof lengthInstructions] ||
			'5-8 key points'
		}:

${text.substring(0, 10000)}

Provide a clear, concise summary.`

		console.log('📝 Generating summary with Prompt API...')
		const summary = await session.prompt(prompt)

		// Cleanup
		session.destroy()

		console.log('✅ Prompt API summary generated')
		return summary
	} catch (err) {
		console.error('❌ Prompt API summarization failed:', err)
		throw err
	}
}
