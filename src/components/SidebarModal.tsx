import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
	ChevronDown,
	ChevronUp,
Copy,
	Download,
	Loader2,
	AlertCircle,
	SettingsIcon
} from 'lucide-react'
import Settings from './Settings'


type SidebarModalProps = {
	videoId: string | null
}

export default function SidebarModal({ videoId }: SidebarModalProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [activeView, setActiveView] = useState<
		'summary' | 'transcript' | null
	>(null)
	const [summary, setSummary] = useState('')
	const [transcript, setTranscript] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [summarySource, setSummarySource] = useState('')
	const [showSettings, setShowSettings] = useState(false)

	useEffect(() => {
		setSummary('')
		setTranscript('')
		setError(null)
		setIsExpanded(false)
		setActiveView(null)
		setSummarySource('')
	}, [videoId])

	const handleFetchTranscript = async () => {
		if (!videoId) return
		setActiveView('transcript')
		setIsExpanded(true)
		setIsLoading(true)
		setError(null)
		try {
			const response = await browser.runtime.sendMessage({
				action: 'getTranscript',
				videoId
			})
			if (response?.success && response?.data) {
				const text = response.data.transcript || ''
				text ? setTranscript(text) : setError('No transcript available')
			} else setError(response?.error || 'Transcript unavailable')
		} catch (err: any) {
			setError('Failed to fetch transcript: ' + err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const handleFetchSummary = async (
		mode: 'brief' | 'detailed' | 'actionable' = 'brief'
	) => {
		if (!videoId) return
		setActiveView('summary')
		setIsExpanded(true)
		setIsLoading(true)
		setError(null)
		try {
			const response = await browser.runtime.sendMessage({
				action: 'getSummary',
				videoId,
				mode
			})
			if (response?.success && response?.data) {
				const text = response.data.summary || ''
				const source = response.data.source || 'unknown'
				text
					? (setSummary(text), setSummarySource(source))
					: setError('No summary available')
			} else setError(response?.error || 'Summary unavailable')
		} catch (err: any) {
			setError('Failed to generate summary: ' + err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCopy = async () => {
		try {
			const text = activeView === 'summary' ? summary : transcript
			if (!text) return
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Copy failed:', err)
		}
	}

	const handleDownload = () => {
		const content =
			activeView === 'summary'
				? `# QuickGist Summary\n\n${summary}`
				: `# YouTube Transcript\n\n${transcript}`
		if (!content || content.endsWith('\n\n')) return
		const blob = new Blob([content], { type: 'text/markdown' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `quickgist-${videoId || 'video'}-${activeView}.md`
		a.click()
		URL.revokeObjectURL(url)
	}

	const getSourceBadge = () => {
		const badges: Record<string, { label: string; color: string }> = {
			'chrome-ai': {
				label: 'Chrome AI',
				color: 'bg-[#e8f0fe] text-[#1a73e8]'
			},
			'prompt-api': {
				label: 'Prompt API',
				color: 'bg-[#f3e8fd] text-[#9334e9]'
			},
			'gemini-api': {
				label: 'Gemini API',
				color: 'bg-[#e8f5e9] text-[#137333]'
			}
		}
		const badge = badges[summarySource]
		if (!badge) return null
		return (
			<span
				className={`text-[11px] font-medium px-2 py-1 rounded ${badge.color}`}>
				{badge.label}
			</span>
		)
	}

	if (showSettings) return <Settings onBack={() => setShowSettings(false)} />

	return (
		<div className='w-full bg-white border border-[#e8eaed] rounded-xl shadow-sm overflow-hidden'>
			{/* Header */}
			<div
				onClick={() => setIsExpanded(!isExpanded)}
				className='flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f8f9fa] transition-colors border-b border-[#e8eaed]'>
				<div className='flex items-center gap-3'>
					<div className='w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center'>
						<svg
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'>
							<path d='M12 2L2 7L12 12L22 7L12 2Z' fill='white' />
							<path
								d='M2 17L12 22L22 17'
								stroke='white'
								strokeWidth='2'
							/>
							<path
								d='M2 12L12 17L22 12'
								stroke='white'
								strokeWidth='2'
							/>
						</svg>
					</div>
					<div>
						<h3 className='text-sm font-medium text-[#202124]'>
							QuickGist
						</h3>
						<p className='text-[11px] text-[#5f6368]'>
							AI-powered summaries
						</p>
					</div>
				</div>
				<button className='p-1.5 hover:bg-[#f1f3f4] rounded-full transition-colors'>
					{isExpanded ? (
						<ChevronUp className='w-4 h-4 text-[#5f6368]' />
					) : (
						<ChevronDown className='w-4 h-4 text-[#5f6368]' />
					)}
				</button>
			</div>

			{/* Actions moved here under header */}
			<div className='border-b border-[#e8eaed] px-4 py-2 bg-[#f8f9fa] flex items-center justify-between'>
				<div className='flex gap-1'>
					<button
						onClick={handleCopy}
						disabled={!summary && !transcript}
						className='p-2 hover:bg-[#e8eaed] rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
						title='Copy'>
						<Copy
							className={`w-6 h-6 ${
								copied ? 'text-[#137333]' : 'text-[#5f6368]'
							}`}
						/>
					</button>
					<button
						onClick={handleDownload}
						disabled={!summary && !transcript}
						className='p-2 hover:bg-[#e8eaed] rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
						title='Download'>
						<Download className='w-6 h-6 text-[#5f6368]' />
					</button>
					<button
						onClick={() => setShowSettings(true)}
						className='p-2 hover:bg-[#e8eaed] rounded-full transition-colors'
						title='Settings'>
						<SettingsIcon className='w-6 h-6 text-[#5f6368]' />
					</button>
				</div>
				<span className='text-[11px] font-medium text-[#5f6368]'>
					QuickGist
				</span>
			</div>

			{/* Collapsed actions */}
			{!isExpanded && (
				<div className='flex gap-2 p-3 bg-[#f8f9fa]'>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleFetchSummary('brief')
						}}
						className='flex-1 py-2 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded transition-colors'>
						Summarize
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleFetchTranscript()
						}}
						className='flex-1 py-2 px-3 bg-white hover:bg-[#f8f9fa] text-[#5f6368] text-sm font-medium rounded border border-[#dadce0] transition-colors'>
						Transcript
					</button>
				</div>
			)}

			{/* Expanded content */}
			{isExpanded && (
				<div className='max-h-[480px] overflow-y-auto p-4 bg-white'>
					{isLoading && (
						<div className='flex items-center gap-3 p-4 bg-[#e8f0fe] rounded-lg'>
							<Loader2 className='w-5 h-5 text-[#1a73e8] animate-spin' />
							<p className='text-sm text-[#1a73e8]'>
								Loading {activeView}...
							</p>
						</div>
					)}

					{error && (
						<div className='flex items-start gap-3 p-4 bg-[#fce8e6] rounded-lg'>
							<AlertCircle className='w-5 h-5 text-[#c5221f]' />
							<div>
								<p className='text-sm font-medium text-[#c5221f]'>
									Error
								</p>
								<p className='text-sm text-[#c5221f] mt-1'>
									{error}
								</p>
							</div>
						</div>
					)}

					{!isLoading &&
						!error &&
						activeView === 'summary' &&
						summary && (
							<div className='space-y-3'>
								{summarySource && (
									<div className='flex items-center gap-2 mb-3'>
										{getSourceBadge()}
									</div>
								)}
								<div className='space-y-2.5'>
									<div className='prose prose-sm max-w-none text-[#202124] dark:text-gray-200'>
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}>
											{summary}
										</ReactMarkdown>
									</div>
								</div>
							</div>
						)}

					{!isLoading &&
						!error &&
						activeView === 'transcript' &&
						transcript && (
							<div className='text-[16px] text-[#202124] whitespace-pre-wrap'>
								{transcript}
							</div>
						)}

					{!isLoading &&
						!error &&
						activeView &&
						!summary &&
						!transcript && (
							<div className='text-center py-8'>
								<p className='text-sm text-[#5f6368]'>
									No {activeView} available
								</p>
							</div>
						)}
				</div>
			)}
		</div>
	)
}
