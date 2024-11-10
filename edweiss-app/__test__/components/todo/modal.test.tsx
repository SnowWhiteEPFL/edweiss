/**
 * @file modal.test.tsx
 * @description Test suite for TodoModalDisplay and FilterModal 
 *              component used in the TodoListScreen
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FilterModalDisplay, TodoModalDisplay } from '@/components/todo/modal';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Firebase Timestamp
jest.mock('@/utils/time', () => ({
    Time: {
        toDate: jest.fn(() => new Date('2021-10-29T12:00:00Z')),
    },
}));

// Firebase callFunction
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

// Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetBackdrop: jest.fn(),
}));

// Simple expo router mock
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));



// ------------------------------------------------------------
// --------------    To do Modal  Test suite    ---------------
// ------------------------------------------------------------

describe('TodoModalDisplay Test Suites', () => {
    const mockOnClose = jest.fn();
    const modalRef = React.createRef<BottomSheetModal>();
    const todo: Todolist.Todo = {
        name: 'Test Todo',
        description: 'Description for test todo',
        dueDate: { seconds: 1635504000, nanoseconds: 0 },
        status: 'in_progress',
    };

    // Reset the time to default value before any test
    beforeEach(() => {
        (Time.toDate as jest.Mock).mockReturnValue(new Date('2021-10-29T12:00:00Z'));
        jest.clearAllMocks();
    });

    it('renders todo details correctly', () => {
        const { getByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={todo}
                onClose={mockOnClose}
            />
        );

        expect(getByText('Test Todo')).toBeTruthy();
        expect(getByText('• Description for test todo')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const { getByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={todo}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('todo:close_btn'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not render anything if todo is undefined', () => {
        const { queryByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={undefined}
                onClose={mockOnClose}
            />
        );

        expect(queryByText('Test Todo')).toBeNull();
    });
});



// ------------------------------------------------------------
// --------------    Filter Modal  Test suite    ---------------
// ------------------------------------------------------------

describe('FilterModalDisplay', () => {
    const mockOnClose = jest.fn();
    const modalRef = React.createRef<BottomSheetModal>();
    const selectedStatus = {
        yet: false,
        in_progress: false,
        done: false,
        archived: false,
    };
    const setSelectedStatus = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders filter options correctly', () => {
        const { getByText } = render(
            <FilterModalDisplay
                modalRef={modalRef}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onClose={mockOnClose}
            />
        );

        expect(getByText('todo:filter_modal_title')).toBeTruthy();
        expect(getByText('todo:name.yet')).toBeTruthy();
        expect(getByText('todo:name.in_progress')).toBeTruthy();
        expect(getByText('todo:name.done')).toBeTruthy();
        expect(getByText('todo:name.archived')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const { getByText } = render(
            <FilterModalDisplay
                modalRef={modalRef}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('todo:close_btn'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
