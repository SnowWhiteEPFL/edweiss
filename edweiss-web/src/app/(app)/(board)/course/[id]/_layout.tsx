import { ApplicationLayout } from '@/constants/Component';
import { IconHash } from '@tabler/icons-react';
import { Route, Routes } from 'react-router-dom';
import IndexRoute from '.';

const CourseLayout: ApplicationLayout = () => {
	return (
		<div className='flex min-h-screen bg-red-500'>
			<div className='fixed w-64 min-h-screen bg-mantle'>
				<div className='p-4 py-4 shadow-xl text-md bg-mantle'>
					Software Entreprise
				</div>

				<div className='px-4'>
					<div className='flex gap-2 items-center mt-2 text-overlay2'>
						<IconHash size={20} stroke={2} />
						<span className='text-sm'>Course</span>
					</div>
					<div className='flex gap-2 items-center mt-2 text-overlay2'>
						<IconHash size={20} stroke={2} />
						<span className='text-sm'>Forum</span>
					</div>
				</div>
			</div>
			<div className='flex-1 ml-64 min-h-full bg-base'>
				<Routes>
					<Route path='/' element={<IndexRoute />} />
				</Routes>
			</div>
		</div>
	);
};

export default CourseLayout;
