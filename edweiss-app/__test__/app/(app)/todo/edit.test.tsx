/**
 * @file edit.test.tsx
 * @description Test suite for EditTodoScreen component
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { render } from '@testing-library/react-native';
import React from 'react';
import EditTodoScreen from '../../../../app/(app)/todo/edit';

// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Application Route
jest.mock('@/constants/Component', () => ({
    ApplicationRoute: jest.fn(),
}));

// Simple expo router mock
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
}));

// AbstractEditor for to dos with editable params
jest.mock('../../../../components/todo/abstractTodoEditor', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        AbstractTodoEditor: ({ editable, todo, id }: { editable: boolean; todo: any; id: string; }) => (
            <TView testID="abstract-todo-editor" editable={editable} todo={todo} id={id} />
        ),
    };
});

// ------------------------------------------------------------
// --------------   Edit To do Screen Test suite   ------------
// ------------------------------------------------------------

describe('EditTodoScreen Tests Suites', () => {

    // Clean mocks before all tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the AbstractTodoEditor component with correct props', () => {
        const mockTodo = { title: "Test Todo", description: "This is a test." };
        const mockParams = {
            idString: "123",
            todoJSON: JSON.stringify(mockTodo),
        };

        // Mocking useLocalSearchParams to return our mock parameters
        (require('expo-router').useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);

        const { getByTestId } = render(<EditTodoScreen />);

        // Check if AbstractTodoEditor is rendered
        expect(getByTestId('abstract-todo-editor')).toBeTruthy();

        // Check if props are passed correctly
        const abstractTodoEditor = getByTestId('abstract-todo-editor');
        expect(abstractTodoEditor.props.editable).toBe(true);
        expect(abstractTodoEditor.props.todo).toEqual(mockTodo);
        expect(abstractTodoEditor.props.id).toBe("123");
    });
});