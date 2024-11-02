// import { AbstractTodoEditor } from '@/components/todo/abstractTodoEditor';
// import { callFunction } from '@/config/firebase';
// import { default as TodoList } from '@/model/todo';
// import { fireEvent, render } from '@testing-library/react-native';
// import React from 'react';

// jest.mock('@/config/firebase', () => ({
//     callFunction: jest.fn(),
// }));

// jest.mock('@react-native-firebase/firestore', () => {
//     return {
//         Timestamp: jest.fn(),
//         // Add any other firestore methods you use in your code
//     };
// });
// jest.mock('react-native-toast-message', () => ({
//     show: jest.fn(),
// }));

// jest.mock('@/config/i18config', () => ({
//     __esModule: true, // This ensures it's treated as a module with a default export
//     default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
// }));

// jest.mock('expo-router', () => ({
//     useRouter: jest.fn(), // Mock useRouter
// }));

// // Mock expo-router Stack and Screen
// jest.mock('expo-router', () => ({
//     router: { push: jest.fn() },
//     Stack: {
//         Screen: jest.fn(({ options }) => (
//             <>{options.title}</> // Simulate rendering the title for the test
//         )),
//     },
// }));

// describe('AbstractTodoEditor', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('renders correctly in create mode', () => {
//         const { getByPlaceholderText } = render(<AbstractTodoEditor />);
//         expect(getByPlaceholderText('todo:name_placeholder')).toBeTruthy();
//     });

//     it('renders correctly in edit mode', () => {
//         const todo: TodoList.Todo = {
//             name: 'Test Todo',
//             description: 'Test Description',
//             status: 'in_progress',
//             dueDate: undefined,
//         };

//         const { getByDisplayValue } = render(<AbstractTodoEditor editable={true} todo={todo} />);
//         expect(getByDisplayValue('Test Todo')).toBeTruthy();
//         expect(getByDisplayValue('Test Description')).toBeTruthy();
//     });

//     it('calls createTodo on save', async () => {
//         (callFunction as jest.Mock).mockResolvedValue({ status: true });

//         const { getByPlaceholderText, getByText } = render(<AbstractTodoEditor />);

//         fireEvent.changeText(getByPlaceholderText('todo:name_placeholder'), 'New Todo');
//         fireEvent.press(getByText('todo:save_button'));

//         expect(callFunction).toHaveBeenCalledWith(
//             expect.anything(),
//             expect.objectContaining({
//                 name: 'New Todo',
//             })
//         );
//     });

// });

import { AbstractTodoEditor } from '@/components/todo/abstractTodoEditor';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { default as TodoList } from '@/model/todo';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';


jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => {
    return {
        Timestamp: jest.fn(),
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


// Mocking DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    return {
        DateTimePicker: ({ onChange }: { onChange: (event: any, date?: Date) => void; }) => {
            React.useEffect(() => {
                const mockDate = new Date(2024, 11, 1); // Simulated date/time change (can customize)
                onChange({ type: 'set' }, mockDate);
            }, [onChange]);
            return null; // No UI is rendered for the mock
        },
    };
});

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
                exportedName: 'todolist_createTodo',
                originalName: 'createTodo',
                path: 'todolist/createTodo',
            }),
            expect.objectContaining({
                name: 'Updated Todo',
                description: 'Existing Description',
                status: 'in_progress',
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



    // CHANGE THE TODO STATUS HERE  


    // DATE TIME PICKER STUFFS

    it('updates dueDate correctly when date picker is used', async () => {
        const todo: TodoList.Todo = {
            name: 'Todo with Date',
            description: 'This todo has a due date',
            status: 'yet',
            dueDate: undefined, // Initial dueDate is undefined
        };

        const { getByText, getByTestId } = render(<AbstractTodoEditor editable={true} todo={todo} />);

        // Assuming you have a test ID for the date holder
        expect(getByTestId('date-holder').props.children).toBe(new Date().toDateString());

        // Grab the TTouchableOpacity that opens the date picker
        const dateButton = getByTestId('date-button'); // Assuming this is the test ID for the touchable opacity
        fireEvent.press(dateButton);

        // Verify that dueDate is updated
        await waitFor(() => {
            // Assuming the date holder is updated with the new date
            expect(getByTestId('date-holder').props.children).toBe(new Date(2024, 11, 1).toDateString());
        });
    });


    // it('updates date correctly when date picker is used', async () => {
    //     const todo: TodoList.Todo = {
    //         name: 'Todo with Date',
    //         description: 'This todo has a due date',
    //         status: 'yet',
    //         dueDate: undefined,
    //     };

    //     const { getByText } = render(<AbstractTodoEditor editable={true} todo={todo} />);

    //     fireEvent.press(getByText('todo:date_btn_title'));
    //     // Simulate a date change here (you might need to customize how the DateTimePicker handles changes)
    //     const mockDate = new Date(2023, 0, 1); // Example date
    //     const datePicker = require('@react-native-community/datetimepicker').DateTimePicker;
    //     datePicker({ onChange: jest.fn() }).props.onChange(null, mockDate);

    //     await waitFor(() => {
    //         // Check that the due date has been updated in the editor
    //         expect(todo.dueDate).not.toBeUndefined();
    //         expect(todo.dueDate).toBeInstanceOf(Date);
    //         expect(todo.dueDate).toEqual(mockDate);
    //     });
    //     await waitFor(() => {
    //         // Check that the due date has been updated in the editor
    //         expect(todo.dueDate).not.toBeUndefined();
    //         expect(todo.dueDate).toBeInstanceOf(Date);
    //     });
    // });

    // it('updates time correctly when time picker is used', async () => {
    //     const todo: TodoList.Todo = {
    //         name: 'Todo with Time',
    //         description: 'This todo has a due time',
    //         status: 'yet',
    //         dueDate: undefined,
    //     };

    //     const { getByText } = render(<AbstractTodoEditor editable={true} todo={todo} />);

    //     fireEvent.press(getByText('todo:time_btn_title'));
    //     // Simulate a time change here (you might need to customize how the DateTimePicker handles changes)
    //     await waitFor(() => {
    //         // Check that the due time has been updated in the editor
    //         expect(getByText('Expected Time Display Text')).toBeTruthy(); // Replace with your actual expected text
    //     });
    // });
});