import TScrollView from '@/components/core/containers/TScrollView';
import RouteHeader from '@/components/core/header/RouteHeader';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import { CollectionOf } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStringParameters } from '@/hooks/routeParameters';
import { Material } from '@/model/school/courses';
import React, { useMemo } from 'react';

const AiGenerateScreen: ApplicationRoute = () => {

    const { id: courseId } = useStringParameters();
    const materialCollection = useDynamicDocs(
        CollectionOf<Material>(`courses/${courseId}/materials`)
    ) || [];

    const currentMaterials = useMemo(() => {
        return materialCollection.filter((material) => {
            const currentTime = new Date().getTime();
            const fromTime = material.data.from.seconds * timeInMS.SECOND;
            const toTime = material.data.to.seconds * timeInMS.SECOND;
            return fromTime <= currentTime && currentTime <= toTime;
        });
    }, [materialCollection, timeInMS.SECOND]);

    const passedMaterials = useMemo(() => {
        return materialCollection.filter((material) => {
            const currentTime = new Date().getTime();
            const toTime = material.data.to.seconds * timeInMS.SECOND;
            return currentTime > toTime;
        });
    }, [materialCollection, timeInMS.SECOND]);

    return (
        <>
            <RouteHeader title="Automate Deck creation" isBold align='center' />
            <TScrollView p={16} backgroundColor="mantle">
                {currentMaterials.map((material) => (<MaterialDisplay item={material.data} key={material.id} />))}

                {passedMaterials.sort((a, b) => b.data.to.seconds - a.data.to.seconds).map((material) => (<MaterialDisplay item={material.data} key={material.id} />))}
            </TScrollView>
        </>
    )
};

export default AiGenerateScreen;