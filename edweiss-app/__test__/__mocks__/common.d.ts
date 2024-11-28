
export interface Document<Type> {
	id: string,
	data: Type
}

export interface RepositoryDocument<Type> extends Document<Type> {
	syncedId: boolean,
	readonly fakeId?: string
}
