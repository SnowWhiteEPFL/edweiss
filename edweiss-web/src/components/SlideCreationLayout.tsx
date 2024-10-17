import { PencilIcon, PhotoIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import { Button, ButtonGroup, Textarea } from '@nextui-org/react'

function index() {
	return (
		<div className='bg-zinc-900 h-screen'>
			<SidePanels />
			<BottomPanel />
			<Canvas />
		</div>
	)
}

export default index

function Canvas() {
	return (
		<div className='light text-black absolute bg-white top-0 bottom-0 left-0 right-0 mx-auto my-auto w-[calc(100vw-33.5rem)] aspect-video shadow-lg'>
			<Textarea defaultValue='Hello everyone !'>
			</Textarea>
		</div>
	)
}

function SidePanels() {
	return (
		<>
			<div className='absolute bg-zinc-800 top-3 left-3 h-[calc(100vh-1.5rem)] z-50 w-60 border border-zinc-700 rounded-2xl p-4 shadow-small'>
				<span className='text-sm'>
					Left panel
				</span>
			</div>
			<div className='absolute bg-zinc-800 top-3 right-3 h-[calc(100vh-1.5rem)] z-50 w-60 border border-zinc-700 rounded-2xl p-4 shadow-small'>
				<span className='text-sm'>Right panel</span>
			</div>
		</>
	)
}

function BottomPanel() {
	return (
		<div className='absolute left-0 right-0 bottom-4 w-fit z-50 mx-auto rounded-2xl border border-zinc-700 p-0 shadow-small'>
			<ButtonGroup>
				<Button isIconOnly>
					<PencilIcon width={20} />
				</Button>
				<Button isIconOnly color='primary'>
					<PhotoIcon width={20} />
				</Button>
				<Button isIconOnly>
					<TableCellsIcon width={20} />
				</Button>
			</ButtonGroup>
		</div>
	)
}
