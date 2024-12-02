import EditMaterial, { testIDs } from '@/components/courses/EditMaterial';
import { Material, MaterialID } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { fireEvent, render } from '@testing-library/react-native';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

// Mock t() function
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:edit_material') return 'Edit Material';
        else if (str === 'course:edit_material_title') return 'Edit the details for the material';
        else if (str === 'course:material_title_label') return 'Title';
        else if (str === 'course:material_title_placeholder') return 'Weekly Material';
        else if (str === 'course:title_too_long') return 'Title is too long';
        else if (str === 'course:material_description_label') return 'Description';
        else if (str === 'course:material_description_placeholder') return 'This week\'s slides';
        else if (str === 'course:description_too_long') return 'Description is too long';
        else if (str === 'course:from_date_label') return 'From Date';
        else if (str === 'course:from_time_label') return 'From Time';
        else if (str === 'course:to_date_label') return 'To Date';
        else if (str === 'course:to_time_label') return 'To Time';
        else if (str === 'course:update_changes') return 'Update Changes';
        else if (str === 'course:delete') return 'Delete';
        else if (str === 'course:field_required') return 'This field cannot be empty';
        else return str;
    })
);


let mockEventType = 'set';
let mockDate = new Date(2012, 3, 4, 12, 34, 56);

jest.mock('@react-native-community/datetimepicker', () => ({
    __esModule: true,
    default: ({ onChange }: any) => {
        return onChange(
            { type: mockEventType },
            mockDate
        );
    },
}));

const setMockEventType = (type: string) => {
    mockEventType = type;
};

const setMockDate = (date: Date) => {
    mockDate = date;
};


describe('Edit Assignment', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function hasTextInChildren(children: any, text: string | number): boolean {
        if (typeof children === 'string' || typeof children === 'number') {
            return children === text;
        }
        if (Array.isArray(children)) {
            return children.some(child => hasTextInChildren(child, text));
        }
        if (children && typeof children === 'object' && children.props) {
            return hasTextInChildren(children.props.children, text);
        }
        return false;
    }

    const material: { id: MaterialID, data: Material } = {
        id: 'material-id',
        data: {
            title: 'Material 1',
            description: 'This is the first material',
            from: Time.fromDate(new Date(2012, 3, 4, 12, 34, 56)),
            to: Time.fromDate(new Date(2012, 3, 8, 12, 34, 56)),
            docs: [],
        }
    };

    const mockOnSubmit = jest.fn();
    const mockOnDelete = jest.fn();

    it('should render the component', () => {
        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        expect(screen.getByTestId(testIDs.editMaterialTitle).props.children).toBe('Edit Material');
        expect(screen.getByTestId(testIDs.editMaterialDescription).props.children).toBe('Edit the details for the material');
        expect(screen.getByTestId(testIDs.scrollView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.titleAndDescriptionView)).toBeTruthy();
        expect(hasTextInChildren(screen.getByTestId(testIDs.titleInput).props.value, 'Material 1')).toBe(true);
        expect(hasTextInChildren(screen.getByTestId(testIDs.descriptionInput).props.value, 'This is the first material')).toBe(true);
        expect(screen.getByTestId(testIDs.fromDateView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromDateInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromDateTitle).props.children).toBe('From Date');
        expect(screen.getByTestId(testIDs.fromDateTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromDateIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromDateText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromTimeInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromTimeTitle).props.children).toBe('From Time');
        expect(screen.getByTestId(testIDs.fromTimeTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromTimeIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fromTimeText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toDateView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toDateInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toDateTitle).props.children).toBe('To Date');
        expect(screen.getByTestId(testIDs.toDateTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toDateIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toDateText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toTimeInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toTimeTitle).props.children).toBe('To Time');
        expect(screen.getByTestId(testIDs.toTimeTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toTimeIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.toTimeText)).toBeTruthy();
        expect(screen.queryByTestId(testIDs.fromDatePicker)).toBeNull();
        expect(screen.queryByTestId(testIDs.fromTimePicker)).toBeNull();
        expect(screen.queryByTestId(testIDs.toDatePicker)).toBeNull();
        expect(screen.queryByTestId(testIDs.toTimePicker)).toBeNull();
        expect(screen.getByTestId(testIDs.finishViews)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitText).props.children).toBe('Update Changes');
        expect(screen.getByTestId(testIDs.deleteTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.deleteView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.deleteText).props.children).toBe('Delete');
    });

    it('should call onSubmit when the submitTouchableOpacity is pressed and all fields have not been modified', () => {

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is pressed', () => {

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.deleteTouchableOpacity));

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onSubmit when the title is empty', () => {

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), '');
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should NOT call onSubmit when the title is too long', () => {

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), 'long'.repeat(10));
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should NOT call onSubmit when the description is too long', () => {

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.descriptionInput), 'long'.repeat(100));
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should call onSubmit when the submitTouchableOpacity is pressed after some changes', () => {

        setMockEventType('set');
        const defaultDate1 = new Date(2012, 3, 4, 12, 34, 56);
        const expectedTime1 = defaultDate1.toTimeString().split(':').slice(0, 2).join(':');

        const defaultDate2 = new Date(2012, 3, 8, 12, 34, 56);
        const expectedTime2 = defaultDate2.toTimeString().split(':').slice(0, 2).join(':');

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), 'Material 5');
        fireEvent.changeText(screen.getByTestId(testIDs.descriptionInput), 'New Description');

        expect(hasTextInChildren(screen.getByTestId(testIDs.titleInput).props.value, 'Material 5')).toBe(true);
        expect(hasTextInChildren(screen.getByTestId(testIDs.descriptionInput).props.value, 'New Description')).toBe(true);

        setMockDate(defaultDate1);
        fireEvent.press(screen.getByTestId(testIDs.fromDateTouchableOpacity));
        expect(screen.getByTestId(testIDs.fromDateText).props.children).toBe(defaultDate1.toDateString());
        fireEvent.press(screen.getByTestId(testIDs.fromTimeTouchableOpacity));
        expect(screen.getByTestId(testIDs.fromTimeText).props.children).toBe(expectedTime1);

        setMockDate(defaultDate2);
        fireEvent.press(screen.getByTestId(testIDs.toDateTouchableOpacity));
        expect(screen.getByTestId(testIDs.toDateText).props.children).toBe(defaultDate2.toDateString());
        fireEvent.press(screen.getByTestId(testIDs.toTimeTouchableOpacity));
        expect(screen.getByTestId(testIDs.toTimeText).props.children).toBe(expectedTime2);

        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('handles dismissed event for DateTimePicker', async () => {
        // Mock the dismissed event
        setMockEventType('dismissed');

        const screen = render(<EditMaterial material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.fromDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.fromTimeTouchableOpacity));

        fireEvent.press(screen.getByTestId(testIDs.toDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toTimeTouchableOpacity));
    });
});