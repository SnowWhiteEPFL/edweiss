import SelectActionsCourse, { testIDs } from '@/components/courses/SelectActionsCourse';
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
        if (str === 'course:add_assignment') return 'Add Assignment';
        else if (str === 'course:add_material') return 'Add Material';
        else return str;
    })
);


describe('SelectActionsCourse', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockOnOutsideClick = jest.fn();
    const mockOnSelectAssignment = jest.fn();
    const mockOnSelectMaterial = jest.fn();

    it('should render the component', () => {
        const screen = render(<SelectActionsCourse
            onOutsideClick={mockOnOutsideClick}
            onSelectAssignment={mockOnSelectAssignment}
            onSelectMaterial={mockOnSelectMaterial}
        />);

        expect(screen.getByText('Add Assignment')).toBeTruthy();
        expect(screen.getByText('Add Material')).toBeTruthy();

        expect(screen.getByTestId(testIDs.screenTouchable)).toBeTruthy();
        expect(screen.getByTestId(testIDs.screenView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addAssignmentBouton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addAssignmentText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addMaterialBouton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addMaterialText)).toBeTruthy();
    });

    it('should call onOutsideClick when the screenTouchable is pressed', () => {
        const screen = render(<SelectActionsCourse
            onOutsideClick={mockOnOutsideClick}
            onSelectAssignment={mockOnSelectAssignment}
            onSelectMaterial={mockOnSelectMaterial}
        />);

        fireEvent.press(screen.getByTestId(testIDs.screenTouchable));

        expect(mockOnOutsideClick).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectAssignment when the addAssignmentBouton is pressed', () => {
        const screen = render(<SelectActionsCourse
            onOutsideClick={mockOnOutsideClick}
            onSelectAssignment={mockOnSelectAssignment}
            onSelectMaterial={mockOnSelectMaterial}
        />);

        fireEvent.press(screen.getByTestId(testIDs.addAssignmentBouton));

        expect(mockOnSelectAssignment).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectMaterial when the addMaterialBouton is pressed', () => {
        const screen = render(<SelectActionsCourse
            onOutsideClick={mockOnOutsideClick}
            onSelectAssignment={mockOnSelectAssignment}
            onSelectMaterial={mockOnSelectMaterial}
        />);

        fireEvent.press(screen.getByTestId(testIDs.addMaterialBouton));

        expect(mockOnSelectMaterial).toHaveBeenCalledTimes(1);
    });
});