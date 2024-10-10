import ReactComponent from '@/constants/Component';
import { IconUser } from '@tabler/icons-react';

const CourseList: ReactComponent<{}> = (props) => {
	return (
		<div className='flex flex-col justify-between items-center py-4 min-h-screen'>
			<div className='flex flex-col gap-4'>
				<CourseDisplay />
				<CourseDisplay />
				<CourseDisplay />
				<CourseDisplay />
			</div>
			<div className='flex flex-col gap-2'>
				<div className='flex overflow-hidden justify-center items-center w-12 rounded-2xl bg-green text-crust aspect-square'>
					<IconUser size={32} />
				</div>
			</div>
		</div>
	);
};

export default CourseList;

const CourseDisplay: ReactComponent<{}> = (props) => {
	return (
		<div className='overflow-hidden w-12 rounded-2xl bg-base aspect-square'>
			<img src='https://cdn.discordapp.com/icons/1282395436837109923/16af443fc2d8b5276d81ad193815b82e.webp?size=240' />
		</div>
	);
};
