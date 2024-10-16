import ReactComponent, { ClassName } from '@/constants/Component';
import { useCourse } from '@/contexts/course';
import { IconCheck, IconClipboard, IconHelpHexagon, IconScript } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const CourseSidebar: ReactComponent<{}> = () => {
	return (
		<>
			<div className='p-4 py-4 text-lg font-semibold tracking-wide border-b shadow-md bg-mantle border-b-crust'>
				Software Entreprise
			</div>

			<div className='px-2 mt-6'>
				<CourseSidebarItem name='Course' link='/' className='py-1.5' icon={<IconScript size={20} stroke={2} />} />
				<CourseSidebarItem name='Forum' link='/forum' className='py-1.5' icon={<IconHelpHexagon size={20} stroke={2} />} />

				<CourseSidebarSection name='ASSIGNMENTS'>
					<CourseSidebarItem link='/assignment/quiz2' name='Quiz 2' right='23:59' color='text-warning' icon={<IconClipboard size={20} stroke={2} />} />
					<CourseSidebarItem link='/assignment/quiz3' name='Quiz 3' right='mardi 22 oct.' icon={<IconClipboard size={20} stroke={2} />} />
					<CourseSidebarItem link='/assignment/homework2' name='Homework 2' right='jeudi 24 oct.' icon={<IconClipboard size={20} stroke={2} />} />
					<CourseSidebarItem link='/assignment/quiz1' name='Quiz 1' className='opacity-50' color='text-green' icon={<IconCheck size={20} stroke={2} />} />
					<CourseSidebarItem link='/assignment/homework1' name='Homework 1' className='opacity-50' color='text-green' icon={<IconCheck size={20} stroke={2} />} />
				</CourseSidebarSection>
			</div>
		</>
	);
};

export default CourseSidebar;

const CourseSidebarItem: ReactComponent<{ name: string, link: string, icon: ReactNode; className?: ClassName; color?: ClassName; right?: string; }> = (props) => {
	const { courseId } = useCourse();
	const currentPath = useLocation().pathname;

	const path = `/course/${courseId}${props.link ?? "/"}`;

	const active = props.link == "/" ? currentPath == `/course/${courseId}/` || currentPath == `/course/${courseId}` : currentPath.startsWith(path);

	return (
		<Link to={path}>
			<div className={twMerge('flex items-center text-overlay2 select-none rounded-md cursor-pointer p-1 px-2', props.className,
				active ? "bg-surface1 text-text" : "hover:bg-surface0", props.color
			)}>
				<div className='flex flex-1 gap-2 items-center'>
					{props.icon}
					<span className='font-medium'>{props.name}</span>
				</div>
				<span className={twMerge('font-medium text-overlay0', props.color)}>{props.right}</span>
			</div>
		</Link>
	);
};

const CourseSidebarSection: ReactComponent<{ name: string, children?: ReactNode; }> = (props) => {
	return (
		<>
			<div className='mt-6 mb-1 text-overlay1'>
				<span className='text-sm font-semibold'>{props.name}</span>
			</div>

			{props.children}
		</>
	);
};
