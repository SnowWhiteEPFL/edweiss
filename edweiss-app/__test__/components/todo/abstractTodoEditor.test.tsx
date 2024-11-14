/**
 * @file edit.test.tsx
 * @description Test suite for AbstractTodoEditor component
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { AbstractTodoEditor } from '@/components/todo/abstractTodoEditor';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { default as TodoList } from '@/model/todo';
import { statusNextMap } from '@/utils/todo/utilsFunctions';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Firebase callFunction
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

// Firebase Timestamp
jest.mock('@react-native-firebase/firestore', () => {
    return {
        Timestamp: jest.fn(),
    };
});

// Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

// Expo router with stack screen to test up buttons and title
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</>
        )),
    },
}));

// DateTimePicker component
// Note: only the set is simulated, one could also add 
//       the onClose event type to capture closing
jest.mock('@react-native-community/datetimepicker', () => ({
    __esModule: true,
    default: ({ onChange }: any) => {
        return onChange(
            { type: 'set' },
            new Date(2012, 3, 4, 12, 34, 56)
        );
    },
}));


// ------------------------------------------------------------
// ---------    Abstract Editor for To do Test suite   --------
// ------------------------------------------------------------

describe('AbstractTodoEditor Tests Suites', () => {

    // Clean the mock's before each tests
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
        (callFunction as jest.Mock).mockImplementation((path, data) => {
            if (path === 'todolist/createTodo') {
                return Promise.resolve({ status: true });
            }
            return Promise.resolve({ status: false });
        });

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText(t('todo:name_placeholder')), 'New Todo');
        fireEvent.press(getByText(t('todo:save_button')));

        expect(callFunction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                name: 'New Todo',
            })
        );
    });

    it('calls updateTodo on save when in edit mode', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        const todo: TodoList.Todo = {
            name: 'Existing Todo',
            description: 'Existing Description',
            status: 'in_progress',
            dueDate: undefined,
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'Updated Todo');
        fireEvent.press(getByText('todo:edit_button'));

        expect(callFunction).toHaveBeenCalledWith(
            expect.objectContaining({
                exportedName: 'todolist_updateTodo',
                originalName: 'updateTodo',
                path: 'todolist/updateTodo',
            }),
            expect.objectContaining({
                id: '1',
                name: 'Updated Todo',
                description: 'Existing Description',
                status: 'in_progress',
                dueDate: undefined,
            })
        );
    });

    it('toogle the todo status and update on save when in edit mode', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        const todo: TodoList.Todo = {
            name: 'Existing Todo',
            description: 'Existing Description',
            status: 'yet',
            dueDate: undefined,
        };

        const { getByTestId, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.press(getByTestId('fancy-button-status-changer'));
        fireEvent.press(getByText('todo:edit_button'));

        expect(callFunction).toHaveBeenCalledWith(
            expect.objectContaining({
                exportedName: 'todolist_updateTodo',
                originalName: 'updateTodo',
                path: 'todolist/updateTodo',
            }),
            expect.objectContaining({
                id: '1',
                name: 'Existing Todo',
                description: 'Existing Description',
                status: statusNextMap[todo.status],
                dueDate: undefined,
            })
        );
    });

    it('change the description update on save when in edit mode', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        const todo: TodoList.Todo = {
            name: 'Existing Todo',
            description: 'Existing Description',
            status: 'yet',
            dueDate: undefined,
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:description_placeholder'), 'New Description');
        fireEvent.press(getByText('todo:edit_button'));

        expect(callFunction).toHaveBeenCalledWith(
            expect.objectContaining({
                exportedName: 'todolist_updateTodo',
                originalName: 'updateTodo',
                path: 'todolist/updateTodo',
            }),
            expect.objectContaining({
                id: '1',
                name: 'Existing Todo',
                description: 'New Description',
                status: 'yet',
                dueDate: undefined,
            })
        );
    });



    it('show sucess on correctly added todo', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
        fireEvent.press(getByText('todo:save_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: "New Todo" + t("todo:was_added_toast"),
            text2: t(`todo:funny_phrase_on_add`),
        }));
    });

    it('shows error toast on failed save', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false });

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
        fireEvent.press(getByText('todo:save_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: 'todo:error_toast_title',
            text2: 'todo:couldnot_save_toast',
        }));
    });

    it('shows error toast on duplicate todo', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false, error: "duplicate_todo" });

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
        fireEvent.press(getByText('todo:save_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'info',
            text1: `todo:already_existing_todo_toast_title`,
            text2: `todo:already_existing_todo_toast_funny`,
        }));
    });

    it('calls deleteTodo when delete button is pressed', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });
        const todo: TodoList.Todo = {
            name: 'Todo to Delete',
            description: 'This todo will be deleted',
            status: 'yet'
        };

        const { getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="2" />);

        fireEvent.press(getByText('todo:delete_btn_title'));

        expect(callFunction).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                id: '2',
            })
        );
    });

    it('shows success toast on successful delete', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });
        const todo: TodoList.Todo = {
            name: 'Todo to Delete',
            description: 'This todo will be deleted',
            status: 'yet',
            dueDate: undefined,
        };

        const { getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="2" />);

        fireEvent.press(getByText('todo:delete_btn_title'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: "Todo to Delete" + t('todo:was_deleted_toast'),
            text2: t('todo:funny_phrase_on_delete'),
        }));
    });

    it('shows error toast on failed delete', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false });
        const todo: TodoList.Todo = {
            name: 'Todo to Delete',
            description: 'This todo will be deleted',
            status: 'yet',
            dueDate: undefined,
        };

        const { getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="2" />);

        fireEvent.press(getByText('todo:delete_btn_title'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_delete_toast'),
        }));
    });

    it('shows error toast when saveAction throws an exception', async () => {
        (callFunction as jest.Mock).mockRejectedValue(new Error('API error'));

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
        fireEvent.press(getByText('todo:save_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t('todo:error_toast_title'),
            text2: t('todo:couldnot_save_toast')
        }));
    });

});



describe('AbstractTodoEditor DateTimePicker', () => {
    const defaultDate = new Date(2012, 3, 4, 12, 34, 56);

    it('should open date picker and set selected date', async () => {
        const { getByTestId } = render(<AbstractTodoEditor />);
        fireEvent.press(getByTestId('date-button'));
        expect(getByTestId('date-holder').props.children).toBe(defaultDate.toDateString());
    });

    it('should open time picker and set selected time', async () => {
        const { getByTestId } = render(<AbstractTodoEditor />);

        fireEvent.press(getByTestId('time-button'));
        const expectedTime = defaultDate.toTimeString().split(':').slice(0, 2).join(':');
        expect(getByTestId('time-holder').props.children).toBe(expectedTime);
    });
});

describe('AbstractTodoEditor API error handling', () => {
    it('shows error toast when editTodoAction fails due to missing id', async () => {
        const todo: TodoList.Todo = {
            name: 'Todo to Edit',
            description: 'This todo will be edited',
            status: 'yet'
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Title');
        fireEvent.press(getByText('todo:edit_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t(`todo:error_toast_title`),
            text2: t(`todo:couldnot_save_toast`)
        }));
    });

    it('shows error toast when editTodoAction fails due to API error', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false });
        const todo: TodoList.Todo = {
            name: 'Todo to Edit',
            description: 'This todo will be edited',
            status: 'yet'
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Title');
        fireEvent.press(getByText('todo:edit_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t(`todo:error_toast_title`),
            text2: t(`todo:couldnot_edit_toast`)
        }));
    });

    it('shows error toast when editTodoAction fails due to duplicate todo error', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: false, error: "duplicate_todo" });
        const todo: TodoList.Todo = {
            name: 'Todo to Edit',
            description: 'This todo will be edited',
            status: 'yet'
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Title');
        fireEvent.press(getByText('todo:edit_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'info',
            text1: `todo:already_existing_todo_toast_title`,
            text2: `todo:already_existing_todo_toast_funny`,
        }));
    });



    it('shows success toast when editTodoAction succeeds', async () => {
        (callFunction as jest.Mock).mockResolvedValue({ status: true });
        const todo: TodoList.Todo = {
            name: 'Todo to Edit',
            description: 'This todo will be edited',
            status: 'yet'
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Title');
        fireEvent.press(getByText('todo:edit_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: 'New Title' + t(`todo:was_edited_toast`),
            text2: t(`todo:funny_phrase_on_edit`)
        }));
    });


    it('shows error toast when editTodoAction fails when updateTodo throws exception', async () => {
        (callFunction as jest.Mock).mockRejectedValue(new Error('API error'));

        const todo: TodoList.Todo = {
            name: 'Todo to Edit',
            description: 'This todo will be edited',
            status: 'yet'
        };

        const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor editable={true} todo={todo} id="1" />);

        fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Title');
        fireEvent.press(getByText('todo:edit_button'));

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith({
            type: 'error',
            text1: t(`todo:error_toast_title`),
            text2: t(`todo:couldnot_edit_toast`)
        }));

    });

});