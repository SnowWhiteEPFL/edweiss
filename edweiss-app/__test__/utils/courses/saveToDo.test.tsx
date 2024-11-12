import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Timestamp } from '@/model/time';
import { saveTodo } from '@/utils/courses/saveToDo';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Mock dependencies
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('@/config/i18config', () => jest.fn((key: string) => key));

jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

describe('saveTodo', () => {
    const mockName = 'Test Todo';
    const mockDueDate = { seconds: 1735689600, nanoseconds: 0 } as Timestamp;
    const mockDescription = 'This is a test description';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call callFunction with correct parameters', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(callFunction).toHaveBeenCalledWith(
            { "exportedName": "todolist_createTodo", "originalName": "createTodo", "path": "todolist/createTodo" },
            {
                name: mockName,
                description: mockDescription,
                dueDate: expect.any(String), // toISOString() date format
                status: "yet",
            }
        );
    });

    it('should navigate back and show success toast on success', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(router.back).toHaveBeenCalled();
        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: t(`course:toast_added_to_todo_text1`),
            text2: t(`course:toast_added_to_todo_text2`),
        });
    });

    it('should show error toast when callFunction fails', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t(`todo:error_toast_title`),
            text2: t(`todo:couldnot_save_toast`),
        });
    });

    it('should show error toast on exception', async () => {
        (callFunction as jest.Mock).mockRejectedValue(new Error('Network Error'));

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t(`todo:error_toast_title`),
            text2: t(`todo:couldnot_save_toast`),
        });
    });
});