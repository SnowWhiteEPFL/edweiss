import { TText } from '@/components/core/TText'
import { TView } from '@/components/core/TView'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'

const index = () => {
	const { id } = useLocalSearchParams();

	return (
		<TView>
			<TText>
				I'm inside a dynamic route ! {id} (plus politiquement ovcoriencot)
			</TText>
		</TView>
	)
}

export default index