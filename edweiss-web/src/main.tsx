import { NextUIProvider } from '@nextui-org/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RootLayout from './app/_layout';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<NextUIProvider>
		<BrowserRouter>
			<main className="min-h-screen dark mocha text-text bg-crust">
				<RootLayout />
			</main>
		</BrowserRouter>
	</NextUIProvider>
);
