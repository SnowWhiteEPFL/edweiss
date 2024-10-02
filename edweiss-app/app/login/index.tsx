import Header from '@/components/core/Header'
import { TText } from '@/components/core/TText'
import { TView } from '@/components/core/containers/TView'
import { signInWithGoogle } from '@/config/firebase'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import React from 'react'

const index = () => {
	return (
		<>
			<Header title='Login' />
			{/* <Stack.Screen
				options={{
					headerShown: false
				}}
			/> */}
			<TView pl={'xl'}>
				<TText>
					I need to login to access the (app) group !
				</TText>

				<GoogleSigninButton onPress={signInWithGoogle} />
			</TView>
		</>
	)
}

export default index