import { Collections, getDocumentRef } from '@/config/firebase'
import { AppUser } from '@/model/users'
import { onSnapshot } from '@react-native-firebase/firestore'
import React, { useContext, useEffect, useState } from 'react'
import { useAuth } from './auth'

interface UserInterface {
	readonly user: AppUser,
	readonly loaded: boolean
}

const UserContext = React.createContext<UserInterface>({} as UserInterface)

export function useUser() {
	return useContext(UserContext)
}

export function UserProvider(props: React.PropsWithChildren) {
	const [user, setUser] = useState<AppUser>()
	const [loaded, setLoaded] = useState(false)

	const { authUser } = useAuth()

	useEffect(() => {
		if (authUser == undefined) {
			setUser(undefined)
			setLoaded(true)
			return
		}

		setLoaded(false)

		const userRef = getDocumentRef(Collections.users, authUser.uid)

		userRef.get().then(user => {
			setUser(user.data())
			setLoaded(true)
		})

		const unsubscribe = onSnapshot(userRef, async (doc) => {
			if (doc.exists)
				setUser(doc.data())
			else
				setUser(undefined)

			setLoaded(true)
		})

		return unsubscribe
	}, [authUser])

	const value: UserInterface = {
		user: user as AppUser,
		loaded
	}

	return (
		<UserContext.Provider value={value}>
			{props.children}
		</UserContext.Provider>
	)
}
