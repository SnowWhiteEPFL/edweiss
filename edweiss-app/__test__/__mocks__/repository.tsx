import { RepositoryDocument } from './common';

export namespace RepositoryMock {

	export function mockRepository<T>(documentsData: T[]) {
		const docs: RepositoryDocument<T>[] = documentsData.map((data, index) => ({
			data,
			id: `${index + 1}`,
			syncedId: true
		}));

		return jest.mock('@/hooks/repository', () => ({
			...jest.requireActual('@/hooks/repository'),
			useRepository: jest.fn(() => [
				docs, {
					addDocument: jest.fn(),
					modifyDocument: jest.fn(),
					deleteDocument: jest.fn(),
					deleteDocuments: jest.fn(),
				}
			]),
			useRepositoryDocument: jest.fn((id: string) => [
				docs.find(doc => doc.id === id) || null, {
					addDocument: jest.fn(),
					modifyDocument: jest.fn(),
					deleteDocument: jest.fn(),
					deleteDocuments: jest.fn(),
				}
			]),
		}));
	}
}
