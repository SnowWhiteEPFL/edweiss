import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { CallResult } from '@/model/functions';
import { AssignmentID, Course_functions, CourseID, MaterialID } from '@/model/school/courses';
import { ProfessorID, StudentID } from '@/model/users';
import Toast from 'react-native-toast-message';

export async function addAssignmentAction(courseId: CourseID, assignmentJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.addAssignment, { courseID: courseId, assignmentJSON: assignmentJSON });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureAddAssignment`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successAddAssignment`),
    });
    return res;
}

export async function addMaterialAction(courseId: CourseID, materialJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.addMaterial, { courseID: courseId, materialJSON: materialJSON });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureAddMaterial`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successAddMaterial`),
    });
    return res;
}

export async function addAssistantAction(courseId: CourseID, assistantId: StudentID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.addAssistant, { courseID: courseId, assistantID: assistantId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureAddAssistant`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successAddAssistant`),
    });
    return res;
}

export async function addProfessorAction(courseId: CourseID, professorId: ProfessorID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.addProfessor, { courseID: courseId, professorID: professorId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureAddProfessor`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successAddProfessor`),
    });
    return res;
}

export async function removeAssignmentAction(courseId: CourseID, assignmentId: AssignmentID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.removeAssignment, { courseID: courseId, assignmentID: assignmentId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureRemoveAssignment`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successRemoveAssignment`),
    });
    return res;
}

export async function removeMaterialAction(courseId: CourseID, materialId: MaterialID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.removeMaterial, { courseID: courseId, materialID: materialId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureRemoveMaterial`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successRemoveMaterial`),
    });
    return res;
}

export async function removeAssistantAction(courseId: CourseID, assistantId: StudentID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.removeAssistant, { courseID: courseId, assistantID: assistantId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureRemoveAssistant`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successRemoveAssistant`),
    });
    return res;
}

export async function removeProfessorAction(courseId: CourseID, professorId: ProfessorID): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.removeProfessor, { courseID: courseId, professorID: professorId });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureRemoveProfessor`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successRemoveProfessor`),
    });
    return res;
}

export async function updateAssignmentAction(courseId: CourseID, assignmentId: AssignmentID, assignmentJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.updateAssignment, { courseID: courseId, assignmentID: assignmentId, assignmentJSON: assignmentJSON });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureUpdateAssignment`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successUpdateAssignment`),
    });
    return res;
}

export async function updateMaterialAction(courseId: CourseID, materialId: MaterialID, materialJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.updateMaterial, { courseID: courseId, materialID: materialId, materialJSON: materialJSON });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureUpdateMaterial`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successUpdateMaterial`),
    });
    return res;
}

export async function updateCourseAction(courseId: CourseID, courseJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.updateCourse, { courseID: courseId, courseJSON: courseJSON });
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: t(`course:failureUpdateCourse`),
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: t(`course:successUpdateCourse`),
    });
    return res;
}

export async function createCourseAction(courseJSON: string): Promise<CallResult<{}, Error>> {
    const res = await callFunction(Course_functions.Functions.createCourse, { courseJSON: courseJSON });
    if (res.status != 1) {
        console.error(res.error);
        return { ...res, error: new Error(res.error) };
    }
    return res;
}
