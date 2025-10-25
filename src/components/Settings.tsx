import { useState, useEffect } from 'react'
import { ArrowLeft, Check } from 'lucide-react'

interface SettingsData {
	autoSummarize: boolean
	summaryStyle: 'bullet' | 'paragraph' | 'detailed'
	summaryLength: 'short' | 'medium' | 'long'
	summaryLanguage: string
}

interface SettingsProps {
	onBack: () => void
}

const DEFAULT_SETTINGS: SettingsData = {
	autoSummarize: false,
	summaryStyle: 'bullet',
	summaryLength: 'medium',
	summaryLanguage: 'en'
}

export default function Settings({ onBack }: SettingsProps) {
	const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		loadSettings()
	}, [])

	const loadSettings = async () => {
		try {
			const result = await browser.storage.local.get('settings')
			const savedSettings = result.settings || DEFAULT_SETTINGS
			setSettings(savedSettings)
		} catch (err) {
			console.error('Failed to load settings:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		setSaving(true)
		setSaved(false)

		try {
			await browser.storage.local.set({ settings })
			setSaved(true)
			setTimeout(() => setSaved(false), 2000)
			console.log('✅ Settings saved:', settings)
		} catch (err) {
			console.error('❌ Failed to save settings:', err)
		} finally {
			setSaving(false)
		}
	}

	const updateSetting = <K extends keyof SettingsData>(
		key: K,
		value: SettingsData[K]
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }))
	}

	if (loading) {
		return (
			<div className='w-[420px] h-[480px] bg-white flex items-center justify-center'>
				<div className='w-10 h-10 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin' />
			</div>
		)
	}

	return (
		<div className='w-[420px] bg-white'>
			{/* Header */}
			<div className='px-6 py-5 border-b border-[#e8eaed]'>
				<div className='flex items-center gap-3'>
					<button
						onClick={onBack}
						className='p-2 hover:bg-[#f1f3f4] rounded-full transition-colors'
						aria-label='Back'>
						<ArrowLeft className='w-5 h-5 text-[#5f6368]' />
					</button>
					<h1 className='text-[22px] font-normal text-[#202124]'>
						Settings
					</h1>
				</div>
			</div>

			{/* Settings Content */}
			<div className='px-6 py-5 space-y-6 max-h-[480px] overflow-y-auto'>
				{/* Auto-summarize */}
				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<div className='flex-1'>
							<label
								htmlFor='auto-summarize'
								className='text-sm font-medium text-[#202124] cursor-pointer'>
								Auto-summarize videos
							</label>
							<p className='text-xs text-[#5f6368] mt-1'>
								Automatically generate summary when you open a
								video
							</p>
						</div>
						<button
							id='auto-summarize'
							onClick={() =>
								updateSetting(
									'autoSummarize',
									!settings.autoSummarize
								)
							}
							className={`relative w-[52px] h-8 rounded-full transition-colors ${
								settings.autoSummarize
									? 'bg-[#1a73e8]'
									: 'bg-[#dadce0]'
							}`}>
							<span
								className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
									settings.autoSummarize
										? 'translate-x-6'
										: 'translate-x-1'
								}`}
							/>
						</button>
					</div>
				</div>

				<div className='border-t border-[#e8eaed]' />

				{/* Summary Style */}
				<div className='space-y-3'>
					<label className='block text-sm font-medium text-[#202124]'>
						Summary style
					</label>
					<div className='space-y-2'>
						{[
							{
								value: 'bullet',
								label: 'Bullet points',
								desc: 'Quick, scannable key points'
							},
							{
								value: 'paragraph',
								label: 'Paragraph',
								desc: 'Flowing narrative format'
							},
							{
								value: 'detailed',
								label: 'Detailed',
								desc: 'Comprehensive with context'
							}
						].map((option) => (
							<label
								key={option.value}
								className='flex items-center gap-3 p-3 hover:bg-[#f8f9fa] rounded-lg cursor-pointer transition-colors'>
								<input
									type='radio'
									name='summaryStyle'
									value={option.value}
									checked={
										settings.summaryStyle === option.value
									}
									onChange={(e) =>
										updateSetting(
											'summaryStyle',
											e.target
												.value as SettingsData['summaryStyle']
										)
									}
									className='w-5 h-5 text-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-0 border-[#dadce0]'
								/>
								<div className='flex-1'>
									<p className='text-sm font-medium text-[#202124]'>
										{option.label}
									</p>
									<p className='text-xs text-[#5f6368]'>
										{option.desc}
									</p>
								</div>
							</label>
						))}
					</div>
				</div>

				<div className='border-t border-[#e8eaed]' />

				{/* Summary Length */}
				<div className='space-y-3'>
					<label className='block text-sm font-medium text-[#202124]'>
						Summary length
					</label>
					<div className='grid grid-cols-3 gap-2'>
						{['short', 'medium', 'long'].map((length) => (
							<button
								key={length}
								onClick={() =>
									updateSetting(
										'summaryLength',
										length as SettingsData['summaryLength']
									)
								}
								className={`py-2.5 px-3 text-sm font-medium rounded border transition-colors ${
									settings.summaryLength === length
										? 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]'
										: 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f8f9fa]'
								}`}>
								{length.charAt(0).toUpperCase() +
									length.slice(1)}
							</button>
						))}
					</div>
				</div>

				<div className='border-t border-[#e8eaed]' />

				{/* Summary Language */}
				<div className='space-y-3'>
					<label
						htmlFor='language'
						className='block text-sm font-medium text-[#202124]'>
						Summary language
					</label>
					<select
						id='language'
						value={settings.summaryLanguage}
						onChange={(e) =>
							updateSetting('summaryLanguage', e.target.value)
						}
						className='w-full px-3 py-2 border border-[#dadce0] rounded text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white text-[#202124]'>
						<option value='en'>English</option>
						<option value='es'>Spanish</option>
						<option value='fr'>French</option>
						<option value='de'>German</option>
						<option value='it'>Italian</option>
						<option value='pt'>Portuguese</option>
						<option value='ja'>Japanese</option>
						<option value='ko'>Korean</option>
						<option value='zh'>Chinese</option>
					</select>
				</div>
			</div>

			{/* Footer */}
			<div className='px-6 py-4 border-t border-[#e8eaed] bg-[#f8f9fa]'>
				<button
					onClick={handleSave}
					disabled={saving}
					className='w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
					{saved ? (
						<>
							<Check className='w-4 h-4' />
							<span>Saved</span>
						</>
					) : saving ? (
						<>
							<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
							<span>Saving...</span>
						</>
					) : (
						<span>Save changes</span>
					)}
				</button>
			</div>
		</div>
	)
}
