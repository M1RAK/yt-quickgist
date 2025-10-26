import { useState, useEffect } from 'react'
import { ArrowLeft, Check } from 'lucide-react'

interface SettingsData {
	summaryStyle: 'bullet' | 'paragraph' | 'detailed'
	summaryLength: 'short' | 'medium' | 'long'
}

interface SettingsProps {
	onBack: () => void
}

const DEFAULT_SETTINGS: SettingsData = {
	summaryStyle: 'bullet',
	summaryLength: 'medium'
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
