import ReactComponent from '@/constants/Component';
import { Input } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';

const QuickSearch: ReactComponent<{}> = () => {
	const [opened, setOpened] = useState(false);

	const handleKeyPress = useCallback((event: KeyboardEvent) => {
		const key = event.key;

		if (event.ctrlKey) {
			if (key === "k") {
				event.preventDefault();
				console.log(`Command pressed: ${key}`);
				setOpened(o => !o);
			}
		}

		if (opened && key === "Escape") {
			event.preventDefault();

			setOpened(false);
		}
	}, [opened]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);

		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	if (!opened)
		return <></>;

	return (
		<div className='absolute right-0 left-0 top-32 z-50'>
			<div className='p-2 mx-auto w-1/2 rounded-xl bg-zinc-700'>
				<Modal />
			</div>
		</div>
	);
};

export default QuickSearch;

const Modal: ReactComponent<{}> = (props) => {
	return (
		<div className=''>
			<Input autoFocus />

			<div className='p-2 mt-2 text-sm rounded-xl bg-zinc-800'>
				<div>
					HELLO
				</div>
				<div>
					HELLO
				</div>
			</div>
		</div>
	);
};
