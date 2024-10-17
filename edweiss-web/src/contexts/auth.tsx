import { CollectionOf, getDocument, listenForAuthStateChange } from '@/config/firebase';
import { AppUser } from '@/model/users';
import { User } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";

interface AuthInterface {
	userLoggedIn: boolean,
	authUser: User | null,
	setCurrentUser: (user: User) => void,
	user: AppUser;
}

const AuthContext = React.createContext<AuthInterface>({
	userLoggedIn: false,
	authUser: null,
	setCurrentUser: (_: User) => { },
	user: undefined as unknown as AppUser,
});

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: any) {
	const [authUser, setAuthUser] = useState<User | null>(null);
	const [user, setUser] = useState<AppUser>();
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = listenForAuthStateChange(initializeUser);
		return unsubscribe;
	}, []);

	async function initializeUser(user: User | null) {
		if (user) {
			setAuthUser({ ...user });

			const fetchedUser = await getDocument(CollectionOf<AppUser>("users"), user.uid);
			setUser(fetchedUser.data);

			setUserLoggedIn(true);
		} else {
			setAuthUser(null);
			setUserLoggedIn(false);
		}

		setLoading(false);
	}

	const value: AuthInterface = {
		userLoggedIn,
		authUser: authUser,
		setCurrentUser: setAuthUser,
		user: user as unknown as AppUser,
	};

	return (
		<AuthContext.Provider value={value}>
			{loading ? <div>LOADING</div> : children}
		</AuthContext.Provider>
	);
}