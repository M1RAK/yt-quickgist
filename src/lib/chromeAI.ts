/**
 * Chrome Built-in AI APIs Integration
 * Uses Gemini Nano running locally in the browser
 */

interface SummarizeOptions {
	type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline'
	format?: 'plain-text' | 'markdown'
	length?: 'short' | 'medium' | 'long'
	sharedContext?: string
}

interface AICapabilities {
	available: 'readily' | 'after-download' | 'no'
}


// Check if Chrome AI Summarizer is available
export async function checkAIAvailability(): Promise<boolean> {
	try {
		// Check if Summarizer API exists (Chrome 138+)
		if (!('Summarizer' in self)) {
			console.log('❌ Chrome AI Summarizer API not available')
			return false
		}

		// @ts-ignore - Chrome AI APIs are experimental
		const availability = await self.Summarizer.availability()

		if (availability === 'no') {
			console.log('❌ Summarizer not available on this device')
			return false
		}

		if (availability === 'after-download') {
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
		if (!('Summarizer' in self)) {
			throw new Error('Chrome AI Summarizer not available')
		}

		const {
			type = 'key-points',
			format = 'markdown',
			length = 'medium',
			sharedContext
		} = options

		console.log('🤖 Creating Chrome AI summarizer...')

		// Create summarizer with options
		const summarizerOptions: any = {
			type,
			format,
			length
		}

		// Add sharedContext if provided
		if (sharedContext) {
			summarizerOptions.sharedContext = sharedContext
		}

		// Add download progress monitoring
		summarizerOptions.monitor = (m: any) => {
			m.addEventListener('downloadprogress', (e: any) => {
				console.log(`⏬ Downloaded ${Math.round(e.loaded * 100)}%`)
			})
		}

		// @ts-ignore
		const summarizer = await self.Summarizer.create(summarizerOptions)

		console.log('📝 Generating summary with Chrome AI...')

		// Use summarize() for batch processing
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

// Streaming version of summarization
export async function summarizeWithChromeAIStreaming(
	text: string,
	options: SummarizeOptions = {},
	onChunk?: (chunk: string) => void
): Promise<string> {
	try {
		if (!('Summarizer' in self)) {
			throw new Error('Chrome AI Summarizer not available')
		}

		const {
			type = 'key-points',
			format = 'markdown',
			length = 'medium',
			sharedContext
		} = options

		console.log('🤖 Creating Chrome AI summarizer for streaming...')

		const summarizerOptions: any = {
			type,
			format,
			length
		}

		if (sharedContext) {
			summarizerOptions.sharedContext = sharedContext
		}

		summarizerOptions.monitor = (m: any) => {
			m.addEventListener('downloadprogress', (e: any) => {
				console.log(`⏬ Downloaded ${Math.round(e.loaded * 100)}%`)
			})
		}

		// @ts-ignore
		const summarizer = await self.Summarizer.create(summarizerOptions)

		console.log('📝 Generating streaming summary with Chrome AI...')

		// Use summarizeStreaming() for streaming
		// @ts-ignore
		const stream = summarizer.summarizeStreaming(text)

		let fullSummary = ''

		for await (const chunk of stream) {
			fullSummary = chunk // Each chunk is cumulative
			if (onChunk) {
				onChunk(chunk)
			}
		}

		// Cleanup
		summarizer.destroy()

		console.log('✅ Chrome AI streaming summary completed')
		return fullSummary
	} catch (err) {
		console.error('❌ Chrome AI streaming summarization failed:', err)
		throw err
	}
}

// Check if Prompt API is available (for fallback)
export async function checkPromptAPIAvailability(): Promise<boolean> {
	try {
		// CRITICAL CHANGE: Use self.LanguageModel instead of window.ai.languageModel
		if (!('LanguageModel' in self)) {
			return false
		}

		// @ts-ignore
		const availability = await self.LanguageModel.availability()
		return availability !== 'no'
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
		// CRITICAL CHANGE: Use self.LanguageModel instead of window.ai.languageModel
		if (!('LanguageModel' in self)) {
			throw new Error('Prompt API not available')
		}

		console.log('🤖 Creating Prompt API session...')

		// CRITICAL CHANGE: Use initialPrompts instead of systemPrompt
		// @ts-ignore
		const session = await self.LanguageModel.create({
			initialPrompts: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that summarizes YouTube video transcripts.'
				}
			]
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

// Streaming version with Prompt API
export async function summarizeWithPromptAPIStreaming(
	text: string,
	style: string = 'bullet',
	length: string = 'medium',
	onChunk?: (chunk: string) => void
): Promise<string> {
	try {
		if (!('LanguageModel' in self)) {
			throw new Error('Prompt API not available')
		}

		console.log('🤖 Creating Prompt API session for streaming...')

		// @ts-ignore
		const session = await self.LanguageModel.create({
			initialPrompts: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that summarizes YouTube video transcripts.'
				}
			]
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

		console.log('📝 Generating streaming summary with Prompt API...')

		// @ts-ignore
		const stream = session.promptStreaming(prompt)

		let fullSummary = ''

		for await (const chunk of stream) {
			fullSummary = chunk // Cumulative
			if (onChunk) {
				onChunk(chunk)
			}
		}

		// Cleanup
		session.destroy()

		console.log('✅ Prompt API streaming summary completed')
		return fullSummary
	} catch (err) {
		console.error('❌ Prompt API streaming summarization failed:', err)
		throw err
	}
}
