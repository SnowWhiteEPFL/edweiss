import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { IconFileTypePdf } from '@tabler/icons-react';
import { ReactNode } from 'react';

const IndexRoute: ApplicationRoute = () => {
	return (
		<div>
			<h1 className='mt-8 ml-8 text-5xl font-bold'>
				Software Entreprise
			</h1>
			<div className='mt-4 ml-8 text-overlay2'>
				<p>This course is about collaboration on a achieving a quite significant software engineering project. The targetted app is to create a swiss army knife for education. We call it EdWeiss, as a contraction of the indigenous mountain flower edelweiss.</p>
			</div>

			<Chapter name='Chapter 2 - Basics of the Scrum strategy' thisWeek>
				<p className='my-2 text-overlay2'>
					This is the chapter 2's description
				</p>

				<div className='flex gap-4 mt-4'>
					<Doc name='Slides02' />
					<Doc name='Readings' />
				</div>
			</Chapter>

			<Chapter name='Chapter 1 - Kotlin & Jetpack Compose'>
				<p className='my-2 text-overlay2'>
					This is the chapter 1's description, amazing !
				</p>

				<div className='flex gap-4 mt-4'>
					<Doc name='Slides01' />
				</div>
			</Chapter>
		</div>
	);
};

export default IndexRoute;

const Chapter: ReactComponent<{ name?: string; children?: ReactNode; thisWeek?: boolean; }> = (props) => {
	return (
		<div className='mt-8 ml-8'>
			<div className='flex'>
				<h2 className='text-3xl font-bold'>
					{props.name}
				</h2>
				{
					props.thisWeek && <div className='flex justify-center items-center px-2 mx-2 text-base rounded-full bg-red'>This week</div>
				}
			</div>
			{props.children}
		</div>
	);
};

const Doc: ReactComponent<{ name?: string; }> = (props) => {
	return (
		<div className='flex flex-col justify-center items-center p-8 py-4 rounded-lg border cursor-pointer select-none border-surface2 hover:border-text'>
			<div className='mb-1'>
				<IconFileTypePdf size={64} stroke={1} />
			</div>
			{props.name}
		</div>
	);
};
