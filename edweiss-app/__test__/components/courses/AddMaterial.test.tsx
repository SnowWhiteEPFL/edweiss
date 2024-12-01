import AddMaterial, { testIDs } from '@/components/courses/AddMaterial';
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
        if (str === 'course:add_material') return 'Add Material';
        else if (str === 'course:add_material_title') return 'Enter the details for the new material';
        else if (str === 'course:material_title_label') return 'Title';
        else if (str === 'course:material_title_placeholder') return 'Week number';
        else if (str === 'course:material_description_label') return 'Description';
        else if (str === 'course:material_description_placeholder') return 'This week\'s slides';
        else if (str === 'course:from_date_label') return 'From Date';
        else if (str === 'course:from_time_label') return 'From Time';
        else if (str === 'course:to_date_label') return 'To Date';
        else if (str === 'course:to_time_label') return 'To Time';
        else if (str === 'course:upload_material') return 'Upload Material';
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


describe('Add Material', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockOnSubmit = jest.fn();

    it('should render the component', () => {
        const screen = render(<AddMaterial onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId(testIDs.addMaterialTitle).props.children).toBe('Add Material');
        expect(screen.getByTestId(testIDs.addMaterialDescription).props.children).toBe('Enter the details for the new material');
        expect(screen.getByTestId(testIDs.scrollView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.titleAndDescriptionView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.titleInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.descriptionInput)).toBeTruthy();

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

        expect(screen.getByTestId(testIDs.finishTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishText).props.children).toBe('Upload Material');
    });

    it('should NOT call onSubmit when the finishTouchableOpacity is pressed but fields not filled', () => {
        const screen = render(<AddMaterial onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should call onSubmit when the finishTouchableOpacity is pressed', () => {

        setMockEventType('set');
        const defaultDate1 = new Date(2012, 3, 4, 12, 34, 56);
        const expectedTime1 = defaultDate1.toTimeString().split(':').slice(0, 2).join(':');

        const defaultDate2 = new Date(2012, 3, 9, 12, 34, 56);
        const expectedTime2 = defaultDate2.toTimeString().split(':').slice(0, 2).join(':');

        const screen = render(<AddMaterial onSubmit={mockOnSubmit} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), 'Week 1');
        fireEvent.changeText(screen.getByTestId(testIDs.descriptionInput), 'This week\'s slides');

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

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('handles dismissed event for DateTimePicker', async () => {
        // Mock the dismissed event
        setMockEventType('dismissed');

        const screen = render(<AddMaterial onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.fromDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.fromTimeTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toTimeTouchableOpacity));
    });
});