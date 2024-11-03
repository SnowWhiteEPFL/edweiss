/**
 * @file create.test.tsx
 * @description Test suite for CreateTodoScreen component
 * @author Adamm Alaoui
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import CreateTodoScreen from '../../../../app/(app)/todo/create';

// Mocking dependencies
jest.mock('@/constants/Component', () => ({
    ApplicationRoute: jest.fn(),
}));

jest.mock('../../../../components/todo/abstractTodoEditor', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        AbstractTodoEditor: () => <TView testID="abstract-todo-editor" />,
    };
});

describe('CreateTodoScreen', () => {
    it('renders the AbstractTodoEditor component', () => {
        const { getByTestId } = render(<CreateTodoScreen />);
        // Check if AbstractTodoEditor is rendered
        expect(getByTestId('abstract-todo-editor')).toBeTruthy();
    });
});