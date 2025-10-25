import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import Settings from '@/components/Settings'

type View = 'dashboard' | 'settings'

function App() {
	const [currentView, setCurrentView] = useState<View>('dashboard')

	return (
		<div className='min-w-[420px] bg-white'>
			{currentView === 'dashboard' && (
				<Dashboard onOpenSettings={() => setCurrentView('settings')} />
			)}
			{currentView === 'settings' && (
				<Settings onBack={() => setCurrentView('dashboard')} />
			)}
		</div>
	)
}

export default App
