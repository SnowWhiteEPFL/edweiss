import { ApplicationLayout } from '@/constants/Component';
import { AuthProvider } from '@/contexts/auth';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './(app)/_layout';
import LoginLayout from './login/_layout';

const RootLayout: ApplicationLayout = () => {
	return (
		<AuthProvider>
			<Routes>
				<Route path='/login/' element={<LoginLayout />} />
				<Route path='/*' element={<AppLayout />} />
			</Routes>
		</AuthProvider>
	);
};

export default RootLayout;

