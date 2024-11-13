import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import Todolist from '@/model/todo';
import { saveTodo } from '@/utils/courses/saveToDo';
import { Time } from '@/utils/time';
import Toast from 'react-native-toast-message';

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('@/config/i18config', () => jest.fn((key: string) => key));

describe('saveTodo', () => {
    const mockName = 'Test Todo';
    const mockDueDate = { seconds: 1672531199, nanoseconds: 0 };
    const mockDescription = 'This is a test description';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call Toast with success message if the response status is true', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.createTodo, {
            name: mockName,
            description: mockDescription,
            dueDate: Time.toDate(mockDueDate).toISOString(),
            status: 'yet',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: t('course:toast_added_to_todo_text1'),
            text2: t('course:toast_added_to_todo_text2'),
        });
    });

    it('should call Toast with info message if response error is "duplicate_todo"', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false, error: 'duplicate_todo' });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.createTodo, {
            name: mockName,
            description: mockDescription,
            dueDate: Time.toDate(mockDueDate).toISOString(),
            status: 'yet',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'info',
            text1: t('todo:already_existing_todo_toast_title'),
            text2: t('todo:already_existing_todo_toast_funny'),
        });
    });

    it('should call Toast with error message if response status is false and error is not "duplicate_todo"', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false });

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.createTodo, {
            name: mockName,
            description: mockDescription,
            dueDate: Time.toDate(mockDueDate).toISOString(),
            status: 'yet',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_save_toast'),
        });
    });

    it('should call Toast with error message if an exception is thrown', async () => {
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await saveTodo(mockName, mockDueDate, mockDescription);

        expect(callFunction).toHaveBeenCalledWith(Todolist.Functions.createTodo, {
            name: mockName,
            description: mockDescription,
            dueDate: Time.toDate(mockDueDate).toISOString(),
            status: 'yet',
        });

        expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_save_toast'),
        });
    });
});
