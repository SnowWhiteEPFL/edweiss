import { CollectionOf } from '@/config/firebase';
import { ApplicationLayout } from '@/constants/Component';
import { createRepository, RepositoryLayout } from '@/hooks/repository';
import Memento from '@/model/memento';

export const DecksRepository = createRepository<Memento.Deck>("my-decks");

const MementoLayout: ApplicationLayout = () => {
	const collection = CollectionOf<Memento.Deck>("decks");
	return <RepositoryLayout repository={DecksRepository} collection={collection} />;
};

export default MementoLayout;
