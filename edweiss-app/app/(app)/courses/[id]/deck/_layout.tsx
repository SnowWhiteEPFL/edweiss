import { CollectionOf } from '@/config/firebase';
import { ApplicationLayout } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { createRepository, RepositoryLayout } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';

export const DecksRepository = createRepository<Memento.Deck>("my-decks");

const MementoLayout: ApplicationLayout = () => {
	const { id: courseId } = useStringParameters();
	const { uid } = useAuth();
	const collection = CollectionOf<Memento.Deck>(`users/${uid}/courses/${courseId}/decks`);
	return <RepositoryLayout repository={DecksRepository} collection={collection} extender={courseId} />;
};

export default MementoLayout;
