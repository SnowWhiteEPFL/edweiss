import { ApplicationLayout } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { Navigate, Route, Routes } from 'react-router-dom';
import BoardLayout from './(board)/_layout';

const AppLayout: ApplicationLayout = () => {
	const { user, userLoggedIn } = useAuth();

	if (!userLoggedIn) {
		return <Navigate to="/login" />;
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	return (
		<Routes>
			<Route path='/*' element={<BoardLayout />} />
		</Routes>
	);
};

export default AppLayout;
