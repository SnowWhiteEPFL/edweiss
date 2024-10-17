import { AbstractTodoEditor } from '@/components/todo/abstractTodoEditor';
import { callFunction } from '@/config/firebase';
import { default as TodoList } from '@/model/todo';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => {
    return {
        Timestamp: jest.fn(),
        // Add any other firestore methods you use in your code
    };
});
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true, // This ensures it's treated as a module with a default export
    default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(), // Mock useRouter
}));

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
}));

describe('AbstractTodoEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly in create mode', () => {
        const { getByPlaceholderText } = render(<AbstractTodoEditor />);
        expect(getByPlaceholderText('todo:name_placeholder')).toBeTruthy();
    });

    it('renders correctly in edit mode', () => {
        const todo: TodoList.Todo = {
            name: 'Test Todo',
            description: 'Test Description',
            status: 'in_progress',
            dueDate: undefined,
        };

        const { getByDisplayValue } = render(<AbstractTodoEditor editable={true} todo={todo} />);
        expect(getByDisplayValue('Test Todo')).toBeTruthy();
        expect(getByDisplayValue('Test Description')).toBeTruthy();
    });

    it('calls createTodo on save', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
        fireEvent.press(getByText('todo:save_button'));

        expect(callFunction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                name: 'New Todo',
            })
        );
    });

});


