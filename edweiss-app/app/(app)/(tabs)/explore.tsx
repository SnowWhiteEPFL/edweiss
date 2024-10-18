import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { ApplicationRoute } from '@/constants/Component';
import { router } from 'expo-router';
import { useState } from 'react';



const ExploreTab: ApplicationRoute = () => {
	const [pageCount, setPageCount] = useState<number>(1);


	return (
		<>
			<RouteHeader title={"Explore"} />


			<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo` as any)}>
				My Todos
			</FancyButton>

			{/* INSERT THE MEMENTO AFTER THIS IN THIS TEMPLATE change router push __*/}
			<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo` as any)}> 
				Memento
			</FancyButton>

		</>
	);
};

export default ExploreTab;