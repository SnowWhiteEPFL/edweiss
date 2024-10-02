import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useContext, useEffect, useState } from 'react';

type User = FirebaseAuthTypes.User;

interface AuthInterface {
	userLoggedIn: boolean,
	authUser: User,
	isLoading: boolean
}

const AuthContext = React.createContext<AuthInterface>(null as unknown as AuthInterface);

const TEMP_INITIAL_AUTH_TIMEOUT = 1500;

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthSessionProvider(props: React.PropsWithChildren) {
	const [currentUser, setCurrentUser] = useState<User>();
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	const [calledInitializeUser, setCalledInitializeUser] = useState(false);

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(initializeUser);
		return unsubscribe;
	}, []);

	async function initializeUser(user: User | null) {
		console.log("Auth: Initialize user");
		setCalledInitializeUser(true);
		setLoading(true);

		setCurrentUser(user ? user : undefined);
		setUserLoggedIn(user != undefined);

		setLoading(false);
	}

	useEffect(() => {
		setTimeout(() => {
			if (loading && !calledInitializeUser) {
				setLoading(false);
			}
		}, TEMP_INITIAL_AUTH_TIMEOUT);
	});

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
