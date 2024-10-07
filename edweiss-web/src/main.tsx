import { NextUIProvider } from '@nextui-org/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<NextUIProvider>
		<BrowserRouter>
			<main className="min-h-screen dark ctp-mocha text-foreground bg-background">
				<App />
			</main>
		</BrowserRouter>
	</NextUIProvider>
);
