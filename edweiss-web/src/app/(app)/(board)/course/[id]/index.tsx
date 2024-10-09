import { ApplicationRoute } from '@/constants/Component';
import { Button } from '@nextui-org/react';

const IndexRoute: ApplicationRoute = () => {
	return (
		<div>
			Hello from course
			<Button color='primary' className='text-medium'>
				Hello from course
			</Button>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
			<div className='my-64'>HELLO</div>
		</div>
	);
};

export default IndexRoute;