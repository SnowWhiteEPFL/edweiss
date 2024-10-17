import ReactComponent, { ClassName } from '@/constants/Component';
import { IconUser } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const CourseList: ReactComponent<{}> = (props) => {
	return (
		<div className='flex flex-col justify-between items-center py-4 min-h-screen'>
			<div className='flex flex-col gap-4'>
				<CourseDisplay />
			</div>
			<div className='flex flex-col gap-4'>
				<QuickLink link='/profile' className='bg-green text-crust'>
					<IconUser size={32} />
				</QuickLink>
			</div>
		</div>
	);
};

export default CourseList;

const CourseDisplay: ReactComponent<{}> = (props) => {
	return (
		<QuickLink link='/course/12345'>
			<img src='https://cdn.discordapp.com/icons/1282395436837109923/16af443fc2d8b5276d81ad193815b82e.webp?size=240' />
		</QuickLink>
	);
};

const QuickLink: ReactComponent<{ className?: ClassName, children?: ReactNode; link: string; }> = (props) => {
	const currentPath = useLocation().pathname;

	const active = currentPath.startsWith(props.link);

	return (
		<div className='relative'>

			{/* <div className='absolute top-[12.5%] -ml-2 w-1 h-3/4 rounded-tr-xl rounded-br-xl bg-blue'></div> */}

			<Link to={props.link}>
				<div className={twMerge('flex overflow-hidden justify-center rounded-3xl transition-all hover:rounded-2xl items-center w-12 bg-base aspect-square', props.className,
					active ? "rounded-2xl" : ""
				)}>
					{props.children}
				</div>
			</Link>
		</div>
	);
};
