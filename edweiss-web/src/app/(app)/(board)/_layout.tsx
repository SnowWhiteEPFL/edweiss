import CourseList from '@/components/layout/CourseList';
import { ApplicationLayout } from '@/constants/Component';
import { Route, Routes } from 'react-router-dom';
import IndexRoute from '.';
import CourseLayout from './course/[id]/_layout';

const BoardLayout: ApplicationLayout = () => {
	return (
		<div className='flex min-h-screen bg-mantle'>
			<div className='fixed w-[4.5rem] min-h-screen bg-crust'>
				<CourseList />
			</div>
			<div className='flex-1 ml-[4.5rem]'>
				<Routes>
					<Route path='/' element={<IndexRoute />} />
					<Route path='/course/:id/*' element={<CourseLayout />} />
				</Routes>
			</div>
		</div>
	);
};

export default BoardLayout;
