/**
 * @file coursesActionsFunctions.test.tsx
 * @description Test file for the course action functions
 * @author Florian Dinant
 */

import { callFunction } from '@/config/firebase';
import { Assignment, AssignmentID, Course_functions, CourseID, Material, MaterialID, UpdateCourseArgs } from '@/model/school/courses';
import { ProfessorID, StudentID } from '@/model/users';
import { addAssignmentAction, addAssistantAction, addMaterialAction, addProfessorAction, createCourseAction, removeAssignmentAction, removeAssistantAction, removeMaterialAction, removeProfessorAction, updateAssignmentAction, updateCourseAction, updateMaterialAction } from '@/utils/courses/coursesActionsFunctions';
import { Time } from '@/utils/time';
import Toast from 'react-native-toast-message';


// Mock the callFunction function
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
    hide: jest.fn(),
}));

jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:successAddAssignment') return 'Assignment added successfully 🎉';
        else if (str === 'course:failureAddAssignment') return 'Failed to add assignment ❌';
        else if (str === 'course:successAddMaterial') return 'Material added successfully 🎉';
        else if (str === 'course:failureAddMaterial') return 'Failed to add material ❌';
        else if (str === 'course:successAddAssistant') return 'Assistant added successfully 🎉';
        else if (str === 'course:failureAddAssistant') return 'Failed to add assistant ❌';
        else if (str === 'course:successAddProfessor') return 'Professor added successfully 🎉';
        else if (str === 'course:failureAddProfessor') return 'Failed to add professor ❌';
        else if (str === 'course:successRemoveAssignment') return 'Assignment removed successfully 🎉';
        else if (str === 'course:failureRemoveAssignment') return 'Failed to remove assignment ❌';
        else if (str === 'course:successRemoveMaterial') return 'Material removed successfully 🎉';
        else if (str === 'course:failureRemoveMaterial') return 'Failed to remove material ❌';
        else if (str === 'course:successRemoveAssistant') return 'Assistant removed successfully 🎉';
        else if (str === 'course:failureRemoveAssistant') return 'Failed to remove assistant ❌';
        else if (str === 'course:successRemoveProfessor') return 'Professor removed successfully 🎉';
        else if (str === 'course:failureRemoveProfessor') return 'Failed to remove professor ❌';
        else if (str === 'course:successUpdateAssignment') return 'Assignment updated successfully 🎉';
        else if (str === 'course:failureUpdateAssignment') return 'Failed to update assignment ❌';
        else if (str === 'course:successUpdateMaterial') return 'Material updated successfully 🎉';
        else if (str === 'course:failureUpdateMaterial') return 'Failed to update material ❌';
        else if (str === 'course:successUpdateCourse') return 'Course updated successfully 🎉';
        else if (str === 'course:failureUpdateCourse') return 'Failed to update course ❌';
        else return str;
    })
);


// Tests
describe('Courses Actions Functions', () => {

    // Mock data
    const mockCourseId: CourseID = 'course-id';
    const mockAssistantId: StudentID = 'assistant-id';
    const mockProfessorId: ProfessorID = 'professor-id';
    const mockAssignment: { id: AssignmentID, data: Assignment } = {
        id: 'assignment-id',
        data: {
            type: 'submission',
            name: 'Test Assignment',
            dueDate: Time.fromDate(new Date('2023-11-12T10:00:00Z')),
        }
    }
    const mockMaterial: { id: MaterialID, data: Material } = {
        id: 'material-id',
        data: {
            title: 'Test Material',
            description: 'This is a test material description.',
            from: Time.fromDate(new Date('2023-11-12T10:00:00Z')),
            to: Time.fromDate(new Date('2023-11-17T10:00:00Z')),
            docs: [],
        }
    }
    const mockCourse: UpdateCourseArgs = {
        name: 'Test Course',
        description: 'This is a test course description.',
        section: 'IN',
        credits: 3,
    }
    const mockAssignmentJSON = JSON.stringify(mockAssignment.data);
    const mockMaterialJSON = JSON.stringify(mockMaterial.data);
    const mockCourseJSON = JSON.stringify(mockCourse);

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addAssignmentAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addAssignmentAction(mockCourseId, mockAssignmentJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.addAssignment, { courseID: mockCourseId, assignmentJSON: mockAssignmentJSON });
        });

        it('should log an error message if adding assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await addAssignmentAction(mockCourseId, mockAssignmentJSON);
            expect(console.error).toHaveBeenCalled();
        });

        it('should toast a success message if adding assignment succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addAssignmentAction(mockCourseId, mockAssignmentJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Assignment added successfully 🎉',
            });
        });

        it('should toast a failure message if adding assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await addAssignmentAction(mockCourseId, mockAssignmentJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to add assignment ❌',
            });
        });

        it('should return status 0 on wrong call', async () => {
            const res = await addAssignmentAction('', mockAssignmentJSON);
            expect(res.status).toBe(0);
        });
    });


    describe('addMaterialAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addMaterialAction(mockCourseId, mockMaterialJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.addMaterial, { courseID: mockCourseId, materialJSON: mockMaterialJSON });
        });

        it('should log an error message if adding material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await addMaterialAction(mockCourseId, mockMaterialJSON);
            expect(console.error).toHaveBeenCalled();
        });

        it('should toast a success message if adding material succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addMaterialAction(mockCourseId, mockMaterialJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Material added successfully 🎉',
            });
        });

        it('should toast a failure message if adding material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await addMaterialAction(mockCourseId, mockMaterialJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to add material ❌',
            });
        });

        it('should return status 0 on wrong call', async () => {
            const res = await addMaterialAction('', mockMaterialJSON);
            expect(res.status).toBe(0);
        });
    });

    describe('addAssistantAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addAssistantAction(mockCourseId, mockAssistantId);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.addAssistant, { courseID: mockCourseId, assistantID: mockAssistantId });
        });
        it('should log an error message if adding assistant fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await addAssistantAction(mockCourseId, mockAssistantId);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if adding assistant succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addAssistantAction(mockCourseId, mockAssistantId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Assistant added successfully 🎉',
            });
        });
        it('should toast a failure message if adding assistant fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await addAssistantAction(mockCourseId, mockAssistantId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to add assistant ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await addAssistantAction('', mockAssistantId);
            expect(res.status).toBe(0);
        });
    });

    describe('addProfessorAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addProfessorAction(mockCourseId, mockProfessorId);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.addProfessor, { courseID: mockCourseId, professorID: mockProfessorId });
        });
        it('should log an error message if adding professor fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await addProfessorAction(mockCourseId, mockProfessorId);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if adding professor succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await addProfessorAction(mockCourseId, mockProfessorId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Professor added successfully 🎉',
            });
        });
        it('should toast a failure message if adding professor fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await addProfessorAction(mockCourseId, mockProfessorId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to add professor ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await addProfessorAction('', mockProfessorId);
            expect(res.status).toBe(0);
        });
    });

    describe('removeAssignmentAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeAssignmentAction(mockCourseId, mockAssignment.id);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.removeAssignment, { courseID: mockCourseId, assignmentID: mockAssignment.id });
        });
        it('should log an error message if removing assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await removeAssignmentAction(mockCourseId, mockAssignment.id);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if removing assignment succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeAssignmentAction(mockCourseId, mockAssignment.id);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Assignment removed successfully 🎉',
            });
        });
        it('should toast a failure message if removing assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await removeAssignmentAction(mockCourseId, mockAssignment.id);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to remove assignment ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await removeAssignmentAction('', mockAssignment.id);
            expect(res.status).toBe(0);
        });
    });

    describe('removeMaterialAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeMaterialAction(mockCourseId, mockMaterial.id);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.removeMaterial, { courseID: mockCourseId, materialID: mockMaterial.id });
        });
        it('should log an error message if removing material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await removeMaterialAction(mockCourseId, mockMaterial.id);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if removing material succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeMaterialAction(mockCourseId, mockMaterial.id);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Material removed successfully 🎉',
            });
        });
        it('should toast a failure message if removing material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await removeMaterialAction(mockCourseId, mockMaterial.id);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to remove material ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await removeMaterialAction('', mockMaterial.id);
            expect(res.status).toBe(0);
        });
    });

    describe('removeAssistantAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeAssistantAction(mockCourseId, mockAssistantId);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.removeAssistant, { courseID: mockCourseId, assistantID: mockAssistantId });
        });
        it('should log an error message if removing assistant fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await removeAssistantAction(mockCourseId, mockAssistantId);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if removing assistant succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeAssistantAction(mockCourseId, mockAssistantId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Assistant removed successfully 🎉',
            });
        });
        it('should toast a failure message if removing assistant fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await removeAssistantAction(mockCourseId, mockAssistantId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to remove assistant ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await removeAssistantAction('', mockAssistantId);
            expect(res.status).toBe(0);
        });
    });

    describe('removeProfessorAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeProfessorAction(mockCourseId, mockProfessorId);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.removeProfessor, { courseID: mockCourseId, professorID: mockProfessorId });
        });
        it('should log an error message if removing professor fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await removeProfessorAction(mockCourseId, mockProfessorId);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if removing professor succed (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await removeProfessorAction(mockCourseId, mockProfessorId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Professor removed successfully 🎉',
            });
        });
        it('should toast a failure message if removing professor fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await removeProfessorAction(mockCourseId, mockProfessorId);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to remove professor ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await removeProfessorAction('', mockProfessorId);
            expect(res.status).toBe(0);
        });
    });

    describe('updateAssignmentAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateAssignmentAction(mockCourseId, mockAssignment.id, mockAssignmentJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.updateAssignment, { courseID: mockCourseId, assignmentID: mockAssignment.id, assignmentJSON: mockAssignmentJSON });
        });
        it('should log an error message if updating assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await updateAssignmentAction(mockCourseId, mockAssignment.id, mockAssignmentJSON);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if updating assignment succeeds (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateAssignmentAction(mockCourseId, mockAssignment.id, mockAssignmentJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Assignment updated successfully 🎉',
            });
        });
        it('should toast a failure message if updating assignment fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await updateAssignmentAction(mockCourseId, mockAssignment.id, mockAssignmentJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to update assignment ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await updateAssignmentAction('', mockAssignment.id, mockAssignmentJSON);
            expect(res.status).toBe(0);
        });
    });

    describe('updateMaterialAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateMaterialAction(mockCourseId, mockMaterial.id, mockMaterialJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.updateMaterial, { courseID: mockCourseId, materialID: mockMaterial.id, materialJSON: mockMaterialJSON });
        });
        it('should log an error message if updating material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await updateMaterialAction(mockCourseId, mockMaterial.id, mockMaterialJSON);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if updating material succeeds (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateMaterialAction(mockCourseId, mockMaterial.id, mockMaterialJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Material updated successfully 🎉',
            });
        });
        it('should toast a failure message if updating material fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await updateMaterialAction(mockCourseId, mockMaterial.id, mockMaterialJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to update material ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await updateMaterialAction('', mockMaterial.id, mockMaterialJSON);
            expect(res.status).toBe(0);
        });
    });

    describe('updateCourseAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateCourseAction(mockCourseId, mockCourseJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.updateCourse, { courseID: mockCourseId, courseJSON: mockCourseJSON });
        });
        it('should log an error message if updating course fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await updateCourseAction(mockCourseId, mockCourseJSON);
            expect(console.error).toHaveBeenCalled();
        });
        it('should toast a success message if updating course succeeds (status 1)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await updateCourseAction(mockCourseId, mockCourseJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Course updated successfully 🎉',
            });
        });
        it('should toast a failure message if updating course fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            await updateCourseAction(mockCourseId, mockCourseJSON);
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Failed to update course ❌',
            });
        });
        it('should return status 0 on wrong call', async () => {
            const res = await updateCourseAction('', mockCourseJSON);
            expect(res.status).toBe(0);
        });
    });

    describe('createCourseAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await createCourseAction(mockCourseJSON);
            expect(callFunction).toHaveBeenCalledWith(Course_functions.Functions.createCourse, { courseJSON: mockCourseJSON });
        });
        it('should log an error message if creating course fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.error = jest.fn();
            await createCourseAction(mockCourseJSON);
            expect(console.error).toHaveBeenCalled();
        });
        it('should return status 0 on wrong call', async () => {
            const res = await createCourseAction('');
            expect(res.status).toBe(0);
        });
    });
});
