import HeartIcon from '@heroicons/react/24/solid/HeartIcon'
import { Button, Input } from '@nextui-org/react'

function App() {
	return (
		<div>
			<span className='text-blue-500'>EdWeiss Web app</span>
			<Button color='primary'>
				Hello
			</Button>
			<Input type="email" label="Email" />
			<Button isIconOnly color='danger'>
				<HeartIcon />
			</Button>
		</div>
	)
}

export default App
