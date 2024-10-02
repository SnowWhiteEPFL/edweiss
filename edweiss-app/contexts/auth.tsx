import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useContext, useEffect, useState } from 'react';

type User = FirebaseAuthTypes.User;

interface AuthInterface {
	userLoggedIn: boolean,
	authUser: User,
	isLoading: boolean
}

const AuthContext = React.createContext<AuthInterface>(null as unknown as AuthInterface);

export function useAuth() {
	return useContext(AuthContext);
}

export function SessionProvider(props: React.PropsWithChildren) {
	const [currentUser, setCurrentUser] = useState<User>();
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(initializeUser);
		return unsubscribe;
	}, []);

	async function initializeUser(user: User | null) {
		console.log("Auth: Initialize user");
		setLoading(true);

		if (user) {
			setCurrentUser(user);
			setUserLoggedIn(true);
		} else {
			setCurrentUser(undefined);
			setUserLoggedIn(false);
		}

		setLoading(false);
	}

	const value: AuthInterface = {
		authUser: currentUser as User,
		userLoggedIn,
		isLoading: currentUser == undefined ? loading : false
	}

	return (
		<AuthContext.Provider value={value}>
			{props.children}
		</AuthContext.Provider>
	);
}
