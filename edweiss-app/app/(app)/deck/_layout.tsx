import { Collections } from '@/config/firebase';
import { ApplicationLayout } from '@/constants/Component';
import { RepositoryLayout, createRepository } from '@/hooks/repository';
import Memento from '@/model/memento';

export const DecksRepository = createRepository<Memento.Deck>("my-decks");

const MementoLayout: ApplicationLayout = () => {
	return <RepositoryLayout signature={DecksRepository} collection={Collections.deck} />;
};

export default MementoLayout;
