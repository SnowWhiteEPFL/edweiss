import ProgressPopup, { useProgressPopup } from '@/components/animations/ProgressPopup';
import TScrollView from '@/components/core/containers/TScrollView';
import RouteHeader from '@/components/core/header/RouteHeader';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import SmthWrongComponent from '@/components/memento/SmthWrongComponent';
import { callFunction, CollectionOf } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useRepository } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { Material } from '@/model/school/courses';
import React, { useMemo } from 'react';
import { DecksRepository } from './_layout';

const AiGenerateScreen: ApplicationRoute = () => {

    const { id: courseId } = useStringParameters();
    const materialCollection = useDynamicDocs(
        CollectionOf<Material>(`courses/${courseId}/materials`)
    ) || [];
    const [decks, handler] = useRepository(DecksRepository);
    const handle = useProgressPopup();

    const currentMaterials = useMemo(() => {
        return materialCollection.filter((material) => {
            const fromTime = material.data.from.seconds * timeInMS.SECOND;
            const toTime = material.data.to.seconds * timeInMS.SECOND;
            const currentTime = new Date().getTime();
            return currentTime <= toTime && fromTime <= currentTime;
        });
    }, [materialCollection, timeInMS.SECOND]);

    const passedMaterials = useMemo(() => {
        return materialCollection.filter((material) => {
            const toTime = material.data.to.seconds * timeInMS.SECOND;
            const currentTime = new Date().getTime();
            return toTime < currentTime;
        });
    }, [materialCollection, timeInMS.SECOND]);

    if (!decks) return <SmthWrongComponent message='Oops, Error loading decks ... ' />;

    const generateByAI = async (materialUrl: string) => {
        console.log("Generating deck from material: ", materialUrl);
        const res = await callFunction(Memento.Functions.createDeckFromMaterial, {
            courseId,
            materialUrl: materialUrl
        });

        if (res.status == 1) {
            const deck = res.data.deck;
            handler.addDocument(deck, Promise.resolve({ status: 1, data: { id: res.data.id } }));
        }

    }

    return (
        <>
            <RouteHeader title="Automate Deck creation" isBold align='center' />
            <TScrollView p={16} backgroundColor="mantle">
                {currentMaterials.map((material) => (<MaterialDisplay item={material.data} courseId={courseId} materialId={material.id} handle={handle} aiGenerateDeck={generateByAI} key={material.id} />))}

                {passedMaterials.sort((a, b) => b.data.to.seconds - a.data.to.seconds).map((material) => (<MaterialDisplay item={material.data} courseId={courseId} materialId={material.id} handle={handle} aiGenerateDeck={generateByAI} key={material.id} />))}
            </TScrollView>

            <ProgressPopup handle={handle} />
        </>
    )
};

export default AiGenerateScreen;