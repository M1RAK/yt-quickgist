import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './App'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Toaster position='top-center' />
		<Popup />
	</React.StrictMode>
)
