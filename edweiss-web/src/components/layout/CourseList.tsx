import ReactComponent from '@/constants/Component';

const CourseList: ReactComponent<{}> = (props) => {
	return (
		<div className='flex flex-col justify-between items-center py-2 min-h-screen'>
			<div className='flex flex-col gap-2'>
				<CourseDisplay />
				<CourseDisplay />
				<CourseDisplay />
				<CourseDisplay />
			</div>
			<div className='flex flex-col gap-2'>
				<CourseDisplay />
			</div>
		</div>
	);
};

export default CourseList;

const CourseDisplay: ReactComponent<{}> = (props) => {
	return (
		<div className='p-1 w-16 rounded-3xl bg-base aspect-square'>

		</div>
	);
};
