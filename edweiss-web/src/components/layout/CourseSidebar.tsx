import ReactComponent, { ClassName } from '@/constants/Component';
import { IconCheck, IconClipboard, IconHelpHexagon, IconScript } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const CourseSidebar: ReactComponent<{}> = (props) => {
	return (
		<>
			<div className='p-4 py-4 text-lg font-semibold tracking-wide border-b shadow-md bg-mantle border-b-crust'>
				Software Entreprise
			</div>

			<div className='px-2 mt-6'>
				<CourseSidebarItem name='Course' className='py-1.5' icon={<IconScript size={20} stroke={2} />} />
				<CourseSidebarItem name='Forum' className='py-1.5' icon={<IconHelpHexagon size={20} stroke={2} />} />

				<div className='mt-6 mb-1 text-overlay1'>
					<span className='text-sm font-semibold'>ASSIGNMENTS</span>
				</div>

				<CourseSidebarItem name='Quiz 2' right='23:59' color='text-warning' icon={<IconClipboard size={20} stroke={2} />} />
				<CourseSidebarItem name='Quiz 3' right='mardi 22 oct.' icon={<IconClipboard size={20} stroke={2} />} />
				<CourseSidebarItem name='Homework 2' right='jeudi 24 oct.' icon={<IconClipboard size={20} stroke={2} />} />

				<CourseSidebarItem name='Quiz 1' className='opacity-50' color='text-green' icon={<IconCheck size={20} stroke={2} />} />
				<CourseSidebarItem name='Homework 1' className='opacity-50' color='text-green' icon={<IconCheck size={20} stroke={2} />} />
			</div>
		</>
	);
};

export default CourseSidebar;

const CourseSidebarItem: ReactComponent<{ name: string, url?: string, icon: ReactNode; className?: ClassName; color?: ClassName; right?: string; }> = (props) => {
	const courseId = '12345';
	return (
		<Link to={`/course/${courseId}${props.url ?? "/"}`}>
			<div className={twMerge('flex items-center text-overlay2 select-none hover:bg-surface0 rounded-md cursor-pointer p-1 px-2', props.className, props.color)}>
				<div className='flex flex-1 gap-2 items-center'>
					{props.icon}
					<span className='font-medium'>{props.name}</span>
				</div>
				<span className={twMerge('font-medium text-overlay0', props.color)}>{props.right}</span>
			</div>
		</Link>
	);
};
