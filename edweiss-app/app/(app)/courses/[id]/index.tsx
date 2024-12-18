/**
 * CoursePage component displays the details of a specific course including its assignments.
 * 
 * @returns {JSX.Element} The rendered component.
 * 
 * The component performs the following tasks:
 * - Retrieves the course ID from the URL parameters.
 * - Fetches the course data from Firestore using the course ID.
 * - Displays a loading indicator while the course data is being fetched.
 * - Sorts the assignments by their due date and assigns a color based on the time remaining until the due date.
 * - Renders a list of assignments that are not yet due.
 * - Provides navigation buttons for additional course resources like slides, exercises, and feedbacks.
 * 
 * The component uses various custom components like TActivityIndicator, TText, TTouchableOpacity, and TView for rendering UI elements.
 * 
 */
import { ArchiveRouteSignature } from '@/app/(app)/courses/[id]/archive';
import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentComponent from '@/components/courses/AssignmentComponent';
import AssignmentDisplay from '@/components/courses/AssignmentDisplay';
import CourseParameters from '@/components/courses/CourseParameters';
import MaterialComponent from '@/components/courses/MaterialComponent';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import SelectActions from '@/components/courses/SelectActionsCourse';
import FancyButton from '@/components/input/FancyButton';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { timeInMS } from '@/constants/Time';
import { useAuth } from '@/contexts/auth';
import { useDoc, useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { pushWithParameters } from '@/hooks/routeParameters';
import { Assignment, AssignmentID, Course, CourseID, Material, MaterialID, UpdateCourseArgs } from '@/model/school/courses';
import { AppUser } from '@/model/users';
import { addAssignmentAction, addMaterialAction, removeAssignmentAction, removeMaterialAction, updateAssignmentAction, updateCourseAction, updateMaterialAction } from '@/utils/courses/coursesActionsFunctions';
import { Time } from '@/utils/time'; // Adjust the import path as necessary
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Animated, Modal } from 'react-native';

// Tests Tags
export const testIDs = {
	courseParametersTouchable: 'course-parameters-touchable',
	courseParametersIcon: 'course-parameters-icon',
	scrollView: 'scroll-view',
	courseDescription: 'course-description',
	upcomingAssignments: 'upcoming-assignments',
	assignemtView: 'assignment-view',
	noAssignmentDue: 'no-assignment-due',
	previousAssignmentTouchable: 'navigate-to-archive-button',
	previousAssignmentsIcon: 'previous-assignments-icon',
	previousAssignmentsText: 'previous-assignments-text',
	materialsTitle: 'materials-title',
	toggleFutureMaterialsTouchable: 'future-materials-display-touchable',
	toggleFutureMaterialsIcon: 'toggle-future-materials-icon',
	toggleFutureMaterialsText: 'toggle-future-materials-text',
	futureMaterialView: 'future-material-view',

	addElementsTouchable: 'add-elements-touchable',
};

type AssignmentWithColor = Assignment & { color: Color; };


/**
 * CoursePage Component
 * 
 * This component is responsible for displaying the details of a specific course.
 * It fetches the course data from Firestore using the course ID obtained from the URL.
 * If the course data is not available, it shows a loading indicator.
 * If the course ID is invalid, it redirects to the home page.
 * 
 * @returns JSX.Element - The rendered component for the course page.
 */
const CoursePage: ApplicationRoute = () => {

	// Get course id from URL
	const { id } = useLocalSearchParams();
	// if (typeof id !== 'string') return <Redirect href={'/'} />;

	const isValidId = typeof id === 'string';

	// Get user id
	const auth = useAuth();
	const uid = auth.authUser?.uid;
	const user = useDoc<AppUser>(CollectionOf<AppUser>('users'), uid);

	// Retrieve course data from Firestore
	const result = usePrefetchedDynamicDoc(
		CollectionOf<Course>('courses'),
		isValidId ? id : '',
		undefined
	);

	const [course] = Array.isArray(result) ? result : [undefined];

	const assignmentsCollection = useDynamicDocs(
		CollectionOf<Assignment>(`courses/${isValidId ? id : ''}/assignments`)
	) || [];

	const materialCollection = useDynamicDocs(
		CollectionOf<Material>(`courses/${isValidId ? id : ''}/materials`)
	) || [];

	// Sort assignments by due date and add color based on time difference
	const assignments: { id: string, data: AssignmentWithColor }[] = assignmentsCollection
		.sort((a, b) => a.data.dueDate.seconds - b.data.dueDate.seconds) // Seconds comparison
		.map((assignment) => {
			const currentTime = new Date().getTime(); // Actual time in milliseconds
			const assignmentDueTime = assignment.data.dueDate.seconds * timeInMS.SECOND; // Convert dueDate to milliseconds
			const timeDifference = assignmentDueTime - currentTime; // Difference between current time and due time

			// Define color based on time difference
			const color =
				0 <= timeDifference && timeDifference <= timeInMS.DAY // Less than 24 hours
					? 'yellow' // Color for less than 24 hours
					: 'darkNight'; // Default color

			return {
				id: assignment.id,
				data: {
					...assignment.data,
					color, // add color to assignment
				},
			};
		});

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

	const futureMaterials = useMemo(() => {
		return materialCollection.filter((material) => {
			const currentTime = new Date().getTime();
			const fromTime = material.data.from.seconds * timeInMS.SECOND;
			return currentTime < fromTime;
		});
	}, [materialCollection, timeInMS.SECOND]);

	// Filter previous assignments
	const previousAssignments = useMemo(() => {
		return assignments.filter((assignment) => Time.isBeforeNow(assignment.data.dueDate)).reverse();
	}, [assignments, timeInMS.SECOND]);

	// Filter upcoming assignments
	const upcomingAssignments = useMemo(() => {
		const filteredAssignments = assignments.filter((assignment) => Time.isAfterNow(assignment.data.dueDate));
		return filteredAssignments.length > 0 ? filteredAssignments : undefined;
	}, [assignments, timeInMS.SECOND]);

	const [showFutureMaterials, setShowFutureMaterials] = useState(false);

	const toggleFutureMaterials = () => {
		setShowFutureMaterials(!showFutureMaterials);
	};

	const [modalParamVisible, setModalParamVisible] = React.useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [actionModalVisible, setActionModalVisible] = useState(false);
	const [modalEditAssignmentVisible, setModalEditAssignmentVisible] = useState(false);
	const [assignmentToEdit, setAssignmentToEdit] = useState<{ id: string, data: Assignment } | null>(null);
	const [modalEditMaterialVisible, setModalEditMaterialVisible] = useState(false);
	const [materialToEdit, setMaterialToEdit] = useState<{ id: string, data: Material } | null>(null);
	const [selectedAction, setSelectedAction] = useState<string | null>(null);
	const [fadeAnim] = useState(new Animated.Value(0));

	const handleButtonPress = () => {
		setActionModalVisible(true);
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		}).start();
	};

	const handleActionSelect = (action: string) => {
		setSelectedAction(action);
		setActionModalVisible(false);
		setModalVisible(true);
	};

	const closeModalOnOutsideClick = () => {
		setActionModalVisible(false);
	};


	const renderProfessorModifButton = useCallback(() => {
		return (
			<TTouchableOpacity
				testID={testIDs.addElementsTouchable}
				style={{
					position: 'absolute',
					bottom: 20,
					right: 20,
					zIndex: 1000,
				}}
				key='addElements'
				onPress={handleButtonPress}
			>
				<Icon testID='plus_button' name="add-circle" size={60} color='blue' />
			</TTouchableOpacity>
		);
	}, []);


	const addAssignmentCallback = useCallback(async (assignment: Assignment): Promise<void> => {
		setModalVisible(false);
		await addAssignmentAction(id as CourseID, assignment);
	}, [id]);

	const addMaterialCallback = useCallback(async (material: Material, deleteOnFirebase: (materialId: MaterialID) => Promise<void>): Promise<void> => {
		setModalVisible(false);
		const res = await addMaterialAction(id as CourseID, material);
		if (res.status) {
			try {
				await deleteOnFirebase(res.data.materialID);
			} catch (error) {
				console.error(error);
			}
		}
	}, [id]);

	const updateAssignmentCallback = useCallback(async (assignment: Assignment, assignmentID: AssignmentID): Promise<void> => {
		setAssignmentToEdit(null);
		setModalEditAssignmentVisible(false);
		await updateAssignmentAction(id as CourseID, assignmentID, assignment);
	}, [id]);

	const updateMaterialCallback = useCallback(async (material: Material, materialID: MaterialID, deleteOnFirebase: (materialId: MaterialID) => Promise<void>): Promise<void> => {
		const json = JSON.stringify(material);
		console.log(json);
		console.log(JSON.parse(json));
		setMaterialToEdit(null);
		setModalEditMaterialVisible(false);
		const res = await updateMaterialAction(id as CourseID, materialID, material);
		if (res.status) {
			try {
				await deleteOnFirebase(materialID);
			} catch (error) {
				console.error(error);
			}
		}
	}, [id]);

	const updateCourseCallback = useCallback(async (course: UpdateCourseArgs): Promise<void> => {
		setModalParamVisible(false);
		await updateCourseAction(id as CourseID, course);
	}, [id]);

	const removeAssignmentCallback = useCallback(async (assignmentID: AssignmentID): Promise<void> => {
		setAssignmentToEdit(null);
		setModalEditAssignmentVisible(false);
		await removeAssignmentAction(id as CourseID, assignmentID);
	}, [id]);

	const removeMaterialCallback = useCallback(async (materialID: MaterialID): Promise<void> => {
		setMaterialToEdit(null);
		setModalEditMaterialVisible(false);
		await removeMaterialAction(id as CourseID, materialID);
	}, [id]);

	//Checks
	if (!isValidId) { return <Redirect href={'/'} />; }
	if (user == undefined || course == undefined || assignmentsCollection == undefined || materialCollection == undefined) { return <TActivityIndicator size={40} />; }

	const userIsProfessor = user.data.type === 'professor' && course.data.professors?.includes(uid);

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader
				title={course.data.name}
				align="center"
				isBold
				right={
					<TTouchableOpacity
						testID={testIDs.courseParametersTouchable}
						key='courseParameters'
						onPress={() => setModalParamVisible(true)}
					>
						<Icon testID={testIDs.courseParametersIcon} name='cog' size={iconSizes.lg} />
					</TTouchableOpacity>
				}
			/>

			{/* ScrollView pour permettre le défilement */}
			<TScrollView testID={testIDs.scrollView} pb={16} px={16} backgroundColor="mantle" >

				<TView alignItems='center' flexDirection='row' mb={'sm'} justifyContent='center'>
					<FancyButton icon='chatbubbles-outline' outlined style={{ borderWidth: 0 }} onPress={() => router.push(`/courses/${id}/forum` as any)}>
						Forum
					</FancyButton>
					<FancyButton icon='school-outline' outlined style={{ borderWidth: 0 }} onPress={() => router.push(`/courses/${id}/deck` as any)}>
						Memento
					</FancyButton>
				</TView>


				<TText testID={testIDs.courseDescription} size={16} color='text' mb={10} >{course.data.description}</TText>

				{/* Section des Pending Assignments */}
				<TText mb={10} mt={20} size={18} color='darkBlue' bold testID={testIDs.upcomingAssignments} >{t(`course:upcoming_assignment_title`)}</TText>

				<For
					each={upcomingAssignments && upcomingAssignments.length > 0 ? upcomingAssignments : undefined}
					fallback={<TText size={16} testID={testIDs.noAssignmentDue}>{t('course:no_assignment_due')}</TText>}
				>{(assignment, index) => (
					<AssignmentDisplay item={assignment.data} id={assignment.id} courseID={id} isTeacher={userIsProfessor} index={index} isSwipeable onSwipeLeft={() => { setAssignmentToEdit(assignment); setModalEditAssignmentVisible(true); }} key={assignment.data.name} />
				)}
				</For>

				{/* Bouton vers les Passed Assignments */}
				<TTouchableOpacity testID={testIDs.previousAssignmentTouchable} mt={5} alignItems='center' onPress={() => pushWithParameters(ArchiveRouteSignature, { courseId: course.id, assignments: previousAssignments })}>
					<TView flexDirection='row' mt={8} mb={16} >
						<Icon
							testID={testIDs.previousAssignmentsIcon}
							name={'chevron-forward-circle'}
							size={iconSizes.md}
							color='cherry'
							mr={8}
						/>
						<TText color='cherry' testID={testIDs.previousAssignmentsText} >{t(`course:previous_assignment_title`)}</TText>
					</TView>
				</TTouchableOpacity>

				<TView flexDirection='row' mb={10} mt={20} alignItems='center'>
					<TText testID={testIDs.materialsTitle} mr={100} size={18} color='darkBlue' bold >{t(`course:materials_title`)}</TText>

					{/* Bouton pour afficher/masquer les "futureMaterials" */}
					<TTouchableOpacity testID={testIDs.toggleFutureMaterialsTouchable} onPress={toggleFutureMaterials}>
						<TView flexDirection='row' alignItems='center' mt={8} mb={8} >
							<Icon
								testID={testIDs.toggleFutureMaterialsIcon}
								name={showFutureMaterials ? 'chevron-down' : 'chevron-forward'}
								size={iconSizes.sm}
								color='blue'
								mr={8}
							/>
							<TText testID={testIDs.toggleFutureMaterialsText} color='blue' align="center">
								{showFutureMaterials ? t('course:hide_future_materials') : t('course:show_future_materials')}
							</TText>
						</TView>
					</TTouchableOpacity>
				</TView>


				{showFutureMaterials && (futureMaterials.length > 0 ? (futureMaterials.sort((a, b) => a.data.to.seconds - b.data.to.seconds).map((material) => (
					<TView testID={testIDs.futureMaterialView} key={material.id}>
						<MaterialDisplay key={material.data.title} item={material.data} courseId={id} materialId={material.id} isTeacher={userIsProfessor} onTeacherClick={() => { setMaterialToEdit(material); setModalEditMaterialVisible(true); }} />
						<TView bb={1} mx={20} mb={12} borderColor='overlay0' />
					</TView>
				))) :
					<TText size={16} color='text' mb={10} >{t('course:no_future_materials')}</TText>
				)}

				{currentMaterials.map((material) => (<MaterialDisplay key={material.data.title} item={material.data} courseId={id} materialId={material.id} isTeacher={userIsProfessor} onTeacherClick={() => { setMaterialToEdit(material); setModalEditMaterialVisible(true); }} />))}

				{passedMaterials.sort((a, b) => b.data.to.seconds - a.data.to.seconds).map((material) => (<MaterialDisplay key={material.data.title} item={material.data} courseId={id} materialId={material.id} isTeacher={userIsProfessor} onTeacherClick={() => { setMaterialToEdit(material); setModalEditMaterialVisible(true); }} />))}

				<TView mb={30} />

			</TScrollView >


			{userIsProfessor && renderProfessorModifButton()}


			< Modal
				visible={actionModalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={() => setActionModalVisible(false)}
				testID='actionModal'
			>
				<Animated.View testID='animatedViewActionSelection' style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', opacity: fadeAnim }}>
					<SelectActions onOutsideClick={closeModalOnOutsideClick} onSelectAssignment={() => handleActionSelect('addAssignment')} onSelectMaterial={() => handleActionSelect('addMaterial')} />
				</Animated.View>
			</Modal>

			<Modal
				visible={modalVisible}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
				testID='addModal'
			>
				<TView testID='addElementView' flex={1} p={20} backgroundColor='mantle'>
					<TTouchableOpacity testID='go-back-button' alignItems="flex-start" onPress={() => setModalVisible(false)}>
						<Icon testID='go-back-button-icon' name={'close'} size={iconSizes.lg} color="blue" mr={8} />
					</TTouchableOpacity>

					{selectedAction === 'addAssignment' && (<AssignmentComponent mode='add' onSubmit={addAssignmentCallback} />)}
					{selectedAction === 'addMaterial' && (<MaterialComponent mode='add' courseId={id} onSubmit={addMaterialCallback} />)}
				</TView>
			</Modal>

			<Modal
				visible={modalParamVisible}
				animationType="slide"
				onRequestClose={() => setModalParamVisible(false)}
				testID='paramModal'
			>
				<CourseParameters course={course} onGiveUp={() => setModalParamVisible(false)} onFinish={updateCourseCallback} />
			</Modal>


			<Modal
				visible={modalEditAssignmentVisible && assignmentToEdit !== null}
				animationType="slide"
				onRequestClose={() => setModalEditAssignmentVisible(false)}
				testID='editAssignmentModal'
			>
				<TView testID='editAssignmentView' flex={1} p={20} backgroundColor='mantle'>
					<TTouchableOpacity testID='go-back-button' alignItems="flex-start" onPress={() => { setModalEditAssignmentVisible(false); }}>
						<Icon testID='go-back-button-icon' name={'close'} size={iconSizes.lg} color="blue" mr={8} />
					</TTouchableOpacity>
					{assignmentToEdit && (
						<AssignmentComponent mode='edit' assignment={assignmentToEdit} onSubmit={updateAssignmentCallback} onDelete={removeAssignmentCallback} />
					)}
				</TView>
			</Modal>

			<Modal
				visible={modalEditMaterialVisible && materialToEdit !== null}
				animationType="slide"
				onRequestClose={() => setModalEditMaterialVisible(false)}
				testID='editMaterialModal'
			>
				<TView testID='editMaterialView' flex={1} p={20} backgroundColor='mantle'>
					<TTouchableOpacity testID='go-back-button' key={'docButton'} alignItems="flex-start" onPress={() => { setModalEditMaterialVisible(false); }}>
						<Icon testID='go-back-button-icon' name={'close'} size={iconSizes.lg} color="blue" mr={8} />
					</TTouchableOpacity>
					{materialToEdit && (
						<MaterialComponent key={'document'} mode='edit' material={materialToEdit} courseId={id} onSubmit={updateMaterialCallback} onDelete={removeMaterialCallback} />
					)}
				</TView>
			</Modal>
		</>
	);
};

export default CoursePage;
