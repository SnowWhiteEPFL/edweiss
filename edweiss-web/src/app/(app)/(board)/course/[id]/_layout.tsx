import CourseSidebar from '@/components/layout/CourseSidebar';
import { ApplicationLayout } from '@/constants/Component';
import { Route, Routes } from 'react-router-dom';
import IndexRoute from '.';

const CourseLayout: ApplicationLayout = () => {
	return (
		<div className='flex min-h-screen bg-red-500'>
			<div className='fixed w-72 min-h-screen bg-mantle'>
				<CourseSidebar />
			</div>
			<div className='flex-1 ml-72 min-h-full bg-base'>
				<Routes>
					<Route path='/' element={<IndexRoute />} />
				</Routes>
			</div>
		</div>
	);
};

export default CourseLayout;
