import TScrollView from '@/components/core/containers/TScrollView';
import RouteHeader from '@/components/core/header/RouteHeader';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import { callFunction, CollectionOf } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { Material } from '@/model/school/courses';
import React, { useMemo } from 'react';
import { Alert } from 'react-native';

const AiGenerateScreen: ApplicationRoute = () => {

    const { id: courseId } = useStringParameters();
    const materialCollection = useDynamicDocs(
        CollectionOf<Material>(`courses/${courseId}/materials`)
    ) || [];

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

    const generateByAI = async (materialUrl: string) => {
        const res = await callFunction(Memento.Functions.createDeckFromMaterial, {
            courseId,
            materialUrl: materialUrl
        });

        console.log(res);

        if (res.status == 1) {
            Alert.alert("All good, generated. Check Firebase.");
        } else {
            Alert.alert(`ERROR: ${JSON.stringify(res)}`);
        }

    }

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