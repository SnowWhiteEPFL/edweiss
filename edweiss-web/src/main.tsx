import { Routes } from '@generouted/react-router'
import { NextUIProvider } from '@nextui-org/react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
	<NextUIProvider>
		<main className="h-screen dark text-foreground bg-background">
			<Routes />
		</main>
	</NextUIProvider>
)
