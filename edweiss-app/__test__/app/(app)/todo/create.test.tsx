/**
 * @file create.test.tsx
 * @description Test suite for CreateTodoScreen component
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { render } from '@testing-library/react-native';
import React from 'react';
import CreateTodoScreen from '../../../../app/(app)/todo/create';

// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Application Route
jest.mock('@/constants/Component', () => ({
    ApplicationRoute: jest.fn(),
}));

// AbstractEditor for to dos
jest.mock('../../../../components/todo/abstractTodoEditor', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        AbstractTodoEditor: () => <TView testID="abstract-todo-editor" />,
    };
});


// ------------------------------------------------------------
// -------------   Create To do Screen Test suite   -----------
// ------------------------------------------------------------

describe('CreateTodoScreen Tests Suites', () => {
    it('renders the AbstractTodoEditor component', () => {
        const { getByTestId } = render(<CreateTodoScreen />);

        expect(getByTestId('abstract-todo-editor')).toBeTruthy();
    });
});