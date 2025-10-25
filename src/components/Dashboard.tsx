import { useState, useEffect } from 'react'
import { useApiKey } from '@/hooks/useApiKey'
import { Settings, Key, CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface DashboardProps {
	onOpenSettings?: () => void
}

export default function Dashboard({ onOpenSettings }: DashboardProps) {
	const {
		scrapingBeeKey,
		geminiApiKey,
		setScrapingBeeKey,
		setGeminiApiKey,
		clearScrapingBeeKey,
		clearGeminiApiKey,
		isLoading
	} = useApiKey()

	const [scrapingBeeInput, setScrapingBeeInput] = useState('')
	const [geminiInput, setGeminiInput] = useState('')
	const [showScrapingBeeInput, setShowScrapingBeeInput] = useState(false)
	const [showGeminiInput, setShowGeminiInput] = useState(false)
	const [saving, setSaving] = useState<'scrapingbee' | 'gemini' | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)

	useEffect(() => {
		if (!isLoading && !scrapingBeeKey) {
			setShowScrapingBeeInput(true)
		}
	}, [isLoading, scrapingBeeKey])

	const handleSaveScrapingBee = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!scrapingBeeInput.trim()) {
			setSaveError('Please enter ScrapingBee API key')
			return
		}

		setSaving('scrapingbee')
		setSaveError(null)

		try {
			await setScrapingBeeKey(scrapingBeeInput)
			setScrapingBeeInput('')
			setShowScrapingBeeInput(false)
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : 'Failed to save')
		} finally {
			setSaving(null)
		}
	}

	const handleSaveGemini = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!geminiInput.trim()) {
			setSaveError('Please enter Gemini API key')
			return
		}

		setSaving('gemini')
		setSaveError(null)

		try {
			await setGeminiApiKey(geminiInput)
			setGeminiInput('')
			setShowGeminiInput(false)
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : 'Failed to save')
		} finally {
			setSaving(null)
		}
	}

	if (isLoading) {
		return (
			<div className='w-[420px] h-[480px] bg-white flex items-center justify-center'>
				<div className='flex flex-col items-center gap-3'>
					<div className='w-10 h-10 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin' />
					<p className='text-sm text-[#5f6368]'>Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='w-[420px] bg-white'>
			{/* Header */}
			<div className='px-6 py-5 border-b border-[#e8eaed]'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center'>
							<svg
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'>
								<path
									d='M12 2L2 7L12 12L22 7L12 2Z'
									fill='white'
								/>
								<path
									d='M2 17L12 22L22 17'
									stroke='white'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M2 12L12 17L22 12'
									stroke='white'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
						<div>
							<h1 className='text-[22px] font-normal text-[#202124]'>
								QuickGist
							</h1>
							<p className='text-[13px] text-[#5f6368]'>
								YouTube Summarizer
							</p>
						</div>
					</div>
					{onOpenSettings && (
						<button
							onClick={onOpenSettings}
							className='p-2 hover:bg-[#f1f3f4] rounded-full transition-colors'
							aria-label='Settings'>
							<Settings className='w-5 h-5 text-[#5f6368]' />
						</button>
					)}
				</div>
			</div>

			{/* Content */}
			<div className='px-6 py-5 space-y-4'>
				{/* ScrapingBee API Key Section */}
				{scrapingBeeKey && !showScrapingBeeInput ? (
					<div className='space-y-3'>
						<div className='flex items-start gap-3 p-4 bg-[#e8f5e9] rounded-lg'>
							<CheckCircle2 className='w-5 h-5 text-[#137333] mt-0.5 flex-shrink-0' />
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium text-[#137333]'>
									ScrapingBee connected
								</p>
								<p className='text-xs text-[#137333] mt-1'>
									Ready to fetch YouTube transcripts
								</p>
							</div>
						</div>

						<div className='flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<Key className='w-4 h-4 text-[#5f6368] flex-shrink-0' />
								<span className='text-sm text-[#5f6368] font-mono truncate'>
									•••••{scrapingBeeKey.slice(-4)}
								</span>
							</div>
							<button
								onClick={() => {
									if (
										confirm('Remove ScrapingBee API key?')
									) {
										clearScrapingBeeKey()
										setShowScrapingBeeInput(true)
									}
								}}
								className='text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium ml-3'>
								Change
							</button>
						</div>
					</div>
				) : (
					<form
						onSubmit={handleSaveScrapingBee}
						className='space-y-3'>
						<div className='flex items-start gap-3 p-4 bg-[#fef7e0] rounded-lg border border-[#f9ab00]'>
							<AlertCircle className='w-5 h-5 text-[#e37400] mt-0.5 flex-shrink-0' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-[#e37400]'>
									ScrapingBee API key required
								</p>
								<p className='text-xs text-[#7c4a00] mt-1'>
									Required to fetch YouTube video transcripts
								</p>
							</div>
						</div>

						<div className='space-y-2'>
							<label
								htmlFor='scrapingbee-key'
								className='block text-sm font-medium text-[#202124]'>
								ScrapingBee API key
							</label>
							<input
								id='scrapingbee-key'
								type='password'
								value={scrapingBeeInput}
								onChange={(e) =>
									setScrapingBeeInput(e.target.value)
								}
								placeholder='Enter your ScrapingBee API key'
								className='w-full px-3 py-2 border border-[#dadce0] rounded text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] font-mono'
								disabled={saving === 'scrapingbee'}
								autoFocus
							/>
						</div>

						<button
							type='submit'
							disabled={
								saving === 'scrapingbee' ||
								!scrapingBeeInput.trim()
							}
							className='w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
							{saving === 'scrapingbee' ? (
								<>
									<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
									<span>Saving...</span>
								</>
							) : (
								<>
									<Key className='w-4 h-4' />
									<span>Save key</span>
								</>
							)}
						</button>

						<div className='pt-3 space-y-2'>
							<p className='text-xs font-medium text-[#202124]'>
								How to get your API key:
							</p>
							<ol className='text-xs text-[#5f6368] space-y-1.5 pl-4'>
								<li className='list-decimal'>
									Visit{' '}
									<a
										href='https://www.scrapingbee.com/youtube-transcript-api/'
										target='_blank'
										rel='noopener noreferrer'
										className='text-[#1a73e8] hover:underline'>
										ScrapingBee YouTube API
									</a>
								</li>
								<li className='list-decimal'>
									Sign up for a free account (1,000 free
									credits)
								</li>
								<li className='list-decimal'>
									Copy your API key from the dashboard
								</li>
								<li className='list-decimal'>Paste it above</li>
							</ol>
						</div>
					</form>
				)}

				{/* Divider */}
				{scrapingBeeKey && (
					<div className='border-t border-[#e8eaed]' />
				)}

				{/* Gemini API Key Section (Optional) */}
				{scrapingBeeKey && (
					<div className='space-y-3'>
						{geminiApiKey && !showGeminiInput ? (
							<>
								<div className='flex items-start gap-3 p-4 bg-[#e8f5e9] rounded-lg'>
									<CheckCircle2 className='w-5 h-5 text-[#137333] mt-0.5 flex-shrink-0' />
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-[#137333]'>
											Gemini API connected
										</p>
										<p className='text-xs text-[#137333] mt-1'>
											Fallback summarization enabled
										</p>
									</div>
								</div>

								<div className='flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]'>
									<div className='flex items-center gap-2 min-w-0 flex-1'>
										<Key className='w-4 h-4 text-[#5f6368] flex-shrink-0' />
										<span className='text-sm text-[#5f6368] font-mono truncate'>
											•••••{geminiApiKey.slice(-4)}
										</span>
									</div>
									<button
										onClick={() => {
											if (
												confirm(
													'Remove Gemini API key?'
												)
											) {
												clearGeminiApiKey()
											}
										}}
										className='text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium ml-3'>
										Remove
									</button>
								</div>
							</>
						) : showGeminiInput ? (
							<form
								onSubmit={handleSaveGemini}
								className='space-y-3'>
								<div className='space-y-2'>
									<label
										htmlFor='gemini-key'
										className='block text-sm font-medium text-[#202124]'>
										Gemini API key{' '}
										<span className='text-[#5f6368] font-normal'>
											(Optional)
										</span>
									</label>
									<input
										id='gemini-key'
										type='password'
										value={geminiInput}
										onChange={(e) =>
											setGeminiInput(e.target.value)
										}
										placeholder='AIza...'
										className='w-full px-3 py-2 border border-[#dadce0] rounded text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] font-mono'
										disabled={saving === 'gemini'}
									/>
								</div>

								<div className='flex gap-2'>
									<button
										type='submit'
										disabled={
											saving === 'gemini' ||
											!geminiInput.trim()
										}
										className='flex-1 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
										{saving === 'gemini'
											? 'Saving...'
											: 'Save'}
									</button>
									<button
										type='button'
										onClick={() =>
											setShowGeminiInput(false)
										}
										className='px-4 py-2 text-[#1a73e8] hover:bg-[#f1f3f4] text-sm font-medium rounded transition-colors'>
										Cancel
									</button>
								</div>

								<p className='text-xs text-[#5f6368]'>
									Get your key at{' '}
									<a
										href='https://aistudio.google.com/apikey'
										target='_blank'
										rel='noopener noreferrer'
										className='text-[#1a73e8] hover:underline'>
										Google AI Studio
									</a>
								</p>
							</form>
						) : (
							<div className='space-y-3'>
								<div className='flex items-start gap-3 p-4 bg-[#e8f0fe] rounded-lg'>
									<Info className='w-5 h-5 text-[#1a73e8] mt-0.5 flex-shrink-0' />
									<div className='flex-1'>
										<p className='text-sm font-medium text-[#1a73e8]'>
											Gemini API (Optional)
										</p>
										<p className='text-xs text-[#174ea6] mt-1'>
											Add as a fallback if Chrome's
											built-in AI is unavailable. Your
											summaries work without this.
										</p>
									</div>
								</div>

								<button
									onClick={() => setShowGeminiInput(true)}
									className='w-full py-2 text-[#1a73e8] hover:bg-[#f1f3f4] text-sm font-medium rounded transition-colors border border-[#dadce0]'>
									Add Gemini API key
								</button>
							</div>
						)}
					</div>
				)}

				{saveError && (
					<div className='p-3 bg-[#fce8e6] rounded-lg border border-[#c5221f]'>
						<p className='text-xs text-[#c5221f]'>{saveError}</p>
					</div>
				)}

				{/* Info Card */}
				{scrapingBeeKey && !showGeminiInput && (
					<div className='p-4 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]'>
						<p className='text-xs font-medium text-[#202124] mb-2'>
							How to use
						</p>
						<ul className='text-xs text-[#5f6368] space-y-1.5'>
							<li className='flex items-start gap-2'>
								<span className='text-[#1a73e8] mt-0.5'>•</span>
								<span>Visit any YouTube video</span>
							</li>
							<li className='flex items-start gap-2'>
								<span className='text-[#1a73e8] mt-0.5'>•</span>
								<span>Click "Summarize" in the sidebar</span>
							</li>
							<li className='flex items-start gap-2'>
								<span className='text-[#1a73e8] mt-0.5'>•</span>
								<span>Get instant AI-powered summaries</span>
							</li>
						</ul>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className='px-6 py-4 border-t border-[#e8eaed] bg-[#f8f9fa]'>
				<p className='text-xs text-[#5f6368] text-center'>
					🔒 Your API keys are stored securely and never shared
				</p>
			</div>
		</div>
	)
}
