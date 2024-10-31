import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import Todolist from '@/model/todo';
import { Timestamp } from '@react-native-firebase/firestore';
import { cleanup } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { sameTodos, statusColorMap, statusIconMap, statusNextAction, statusNextMap, toogleArchivityOfTodo } from '../../utils/todo/utilsFunctions';


// Jest can mock functions in order not to have an actual firebase fetch function for each test needed
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));
// Mock function for toast message simulation
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));
// Mock function for I18config module
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

// Sample model of todo to use during tests
const mockTodo: Todolist.Todo = {
    name: 'Test Todo',
    description: 'Test Description',
    status: 'yet',
    dueDate: new Timestamp(0, 0)
};

// Mock console.error before each test
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

// after each test cleanup in order to not have conflicts and restore all mocks
afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
});

describe('statusNextAction', () => {
    test('should update status and show success toast on success', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true }); // simulates a callFunction from firebase with good execution

        await statusNextAction('123', mockTodo);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.updateTodo, {
            status: statusNextMap[mockTodo.status],
            id: '123',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: mockTodo.name + t('todo:was_edited_toast'),
            text2: t('todo:funny_phrase_on_edit'),
        });
    });

    test('should show error toast on failure', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false });  // simulates a callFunction from firebase with error result

        await statusNextAction('123', mockTodo);

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_edit_toast'),
        });
    });

    test('should show error toast on exception', async () => {
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await statusNextAction('123', mockTodo);

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_edit_toast'),
        });
        expect(console.error).toHaveBeenCalledWith('Error updating todo:', expect.any(Error));
    });
});

describe('toogleArchivityOfTodo', () => {
    test('should archive todo and show success toast on success', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });

        await toogleArchivityOfTodo('123', mockTodo);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.updateTodo, {
            status: 'archived',
            id: '123',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: `${mockTodo.name} was ${t('todo:archived_success_toast')}`,
            text2: t('todo:archived_success_toast_sub'),
        });
    });

    test('should unarchive todo and show success toast on success', async () => {
        const archivedTodo: Todolist.Todo = { ...mockTodo, status: 'archived' };
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });

        await toogleArchivityOfTodo('123', archivedTodo);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.updateTodo, {
            status: 'yet',
            id: '123',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: `${archivedTodo.name} was ${t('todo:unarchived_success_toast')}`,
            text2: t('todo:unarchived_success_toast_sub'),
        });
    });

    test('should log error on failure', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false });

        await toogleArchivityOfTodo('123', mockTodo);

        expect(console.error).toHaveBeenCalledWith('Failed to update todo:', undefined);
    });

    test('should log error on exception', async () => {
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await toogleArchivityOfTodo('123', mockTodo);

        expect(console.error).toHaveBeenCalledWith('Error updating todo:', expect.any(Error));
    });
});

describe('sameTodos', () => {
    test('should return true if todos are identical', () => {
        const todo1 = { ...mockTodo };
        const todo2 = { ...mockTodo };

        const result = sameTodos(todo1, todo2);
        expect(result).toBe(true);
    });

    test('should return false if todos are different', () => {
        const todo1 = { ...mockTodo };
        const todo2 = { ...mockTodo, name: 'Different Name' };

        const result = sameTodos(todo1, todo2);
        expect(result).toBe(false);
    });
});

describe('statusIconMap', () => {
    test('should map status to the correct icon', () => {
        expect(statusIconMap.yet).toBe('alert-circle');
        expect(statusIconMap.in_progress).toBe('construct');
        expect(statusIconMap.done).toBe('checkmark-done-circle');
        expect(statusIconMap.archived).toBe('archive');
    });
});

describe('statusColorMap', () => {
    test('should map status to the correct color', () => {
        expect(statusColorMap.yet).toBe('red');
        expect(statusColorMap.in_progress).toBe('yellow');
        expect(statusColorMap.done).toBe('green');
        expect(statusColorMap.archived).toBe('overlay0');
    });
});
