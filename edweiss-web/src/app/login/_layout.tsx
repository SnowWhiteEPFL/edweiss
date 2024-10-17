import { ApplicationLayout } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginRoute from '.';

const LoginLayout: ApplicationLayout = () => {
	const { userLoggedIn } = useAuth();

	if (userLoggedIn)
		return <Navigate to={'/'} />;

	return (
		<Routes>
			<Route path='/' element={<LoginRoute />} />
		</Routes>
	);
};

export default LoginLayout;
