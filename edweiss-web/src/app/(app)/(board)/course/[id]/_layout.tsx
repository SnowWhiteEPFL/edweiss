import { ApplicationLayout } from '@/constants/Component';
import { IconCheck, IconClipboard, IconHelpHexagon, IconScript } from '@tabler/icons-react';
import { Route, Routes } from 'react-router-dom';
import IndexRoute from '.';

const CourseLayout: ApplicationLayout = () => {
	return (
		<div className='flex min-h-screen bg-red-500'>
			<div className='fixed w-72 min-h-screen bg-mantle'>
				<div className='p-4 py-4 text-lg font-semibold tracking-wide shadow-md bg-mantle'>
					Software Entreprise
				</div>

				<div className='px-4 mt-8'>
					<div className='flex gap-2 items-center mt-3 text-overlay2'>
						<IconScript size={20} stroke={2} />
						<span className='font-medium'>Course</span>
					</div>
					<div className='flex gap-2 items-center mt-3 text-overlay2'>
						<IconHelpHexagon size={20} stroke={2} />
						<span className='font-medium'>Forum</span>
					</div>

					<div className='mt-8 -ml-1 -mb-0.5 text-overlay1'>
						<span className='text-sm font-semibold'>ASSIGNMENTS</span>
					</div>
					<div className='flex mt-1.5 text-warning'>
						<div className='flex flex-1 gap-2 items-center'>
							<IconClipboard size={20} stroke={2} />
							<span className='font-medium'>Quiz 2</span>
						</div>
						<span className='font-medium'>23:59</span>
					</div>
					<div className='flex mt-1.5 text-overlay2'>
						<div className='flex flex-1 gap-2 items-center'>
							<IconClipboard size={20} stroke={2} />
							<span className='font-medium'>Quiz 3</span>
						</div>
						<span className='font-medium text-overlay0'>mardi 18 oct.</span>
					</div>
					<div className='flex mt-1.5 text-overlay2'>
						<div className='flex flex-1 gap-2 items-center'>
							<IconClipboard size={20} stroke={2} />
							<span className='font-medium'>Homework 2</span>
						</div>
						<span className='font-medium text-overlay0'>mardi 20 oct.</span>
					</div>
					<div className='flex mt-1.5 text-green opacity-50'>
						<div className='flex flex-1 gap-2 items-center'>
							<IconCheck size={20} stroke={2} />
							<span className='font-medium'>Quiz 1</span>
						</div>
					</div>
					<div className='flex mt-1.5 text-green opacity-50'>
						<div className='flex flex-1 gap-2 items-center'>
							<IconCheck size={20} stroke={2} />
							<span className='font-medium'>Homework 1</span>
						</div>
					</div>
				</div>
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
