import { fillMCQFromGeneratedFields } from '@/app/(app)/quiz/createQuizPage';
import TScrollView from '@/components/core/containers/TScrollView';
import { ModalContainerScrollView } from '@/components/core/modal/ModalContainer';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import { CollectionOf, callFunction } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Quizzes from '@/model/quizzes';
import { Material } from '@/model/school/courses';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useMemo } from 'react';
import { ProgressPopupHandle } from '../animations/ProgressPopup';


const SelectMaterialForQuizModal: ReactComponent<{ courseId: string, handle: ProgressPopupHandle, addToExerciseList: (exercise: Quizzes.Exercise) => void, modalRef: React.RefObject<BottomSheetModalMethods> }> = (props) => {

	const materialCollection = useDynamicDocs(
		CollectionOf<Material>(`courses/${props.courseId}/materials`)
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


	const generateByAi = async (materialUrl: string) => {
		props.handle.start();

		console.log("Calling AI function...");
		props.modalRef?.current?.close()


		const res = await callFunction(Quizzes.Functions.generateQuizContentFromMaterial, {
			courseId: props.courseId,
			materialUrl: materialUrl
		});

		console.log(JSON.stringify(res));

		if (res.status == 1) {
			res.data.generatedExercises.forEach(exo =>
				props.addToExerciseList(fillMCQFromGeneratedFields(exo.question, exo.propositions))
			);

		}

		props.handle.stop();

	}

	return (
		<>
			<ModalContainerScrollView modalRef={props.modalRef} snapPoints={['90%']} disabledDynamicSizing testID='modal-scroll'>
				<TScrollView p={16} backgroundColor="mantle" testID='scroll-view'>
					{currentMaterials.map((material) => (<MaterialDisplay item={material.data} courseId={props.courseId} materialId={material.id} aiGenerateQuiz={generateByAi} handle={props.handle} key={material.id} />))}

					{passedMaterials.sort((a, b) => b.data.to.seconds - a.data.to.seconds).map((material) => (<MaterialDisplay item={material.data} courseId={props.courseId} materialId={material.id} aiGenerateQuiz={generateByAi} handle={props.handle} key={material.id} />))}
				</TScrollView>
			</ModalContainerScrollView>

		</>
	)
};

export default SelectMaterialForQuizModal;