import React, { ReactNode, useContext, useState } from 'react';

export interface AppUser {
	username: string,
	age: number,
	sciper: string
}

const AuthContext = React.createContext<AppUser>({} as unknown as AppUser);

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthContextProvider(props: { children: ReactNode }) {
	const [user, setUser] = useState<AppUser>({
		username: "user",
		age: 20,
		sciper: "123456"
	});

	return (
		<AuthContext.Provider value={user}>
			{props.children}
		</AuthContext.Provider>
	)
}
