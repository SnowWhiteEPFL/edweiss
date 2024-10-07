import ReactComponent from '@/constants/Component';
import { Button } from '@nextui-org/react';
import QuickSearch from './components/QuickSearch';

const App: ReactComponent<{}> = () => {

	return (
		<>
			<QuickSearch />

			<div className='flex bg-ctp-mantle'>
				<div className='fixed p-2 w-20 min-h-screen bg-ctp-crust'>
					Courses
				</div>
				<div className='fixed left-20 p-2 w-64 min-h-screen bg-ctp-mantle'>
					Content
				</div>
				<div className='flex-1 ml-[21rem] min-h-screen'>
					<div className='p-2 min-h-full rounded-md bg-ctp-base'>
						<div className='my-32'>
							Content
						</div>
						<div>
							<Button color="default" className='mx-2'>
								Hello everyone
							</Button>
							<Button color="primary" className='mx-2'>
								Hello everyone
							</Button>
							<Button color="danger" className='mx-2'>
								Hello everyone
							</Button>
						</div>
						<div className='mt-4'>
							<Button color="success" className='mx-2'>
								Hello everyone
							</Button>
							<Button color="secondary" className='mx-2'>
								Hello everyone
							</Button>
							<Button color="warning" className='mx-2'>
								Hello everyone
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default App;
