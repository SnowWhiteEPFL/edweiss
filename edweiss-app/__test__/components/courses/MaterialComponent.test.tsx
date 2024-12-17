import MaterialComponent, { testIDs } from '@/components/courses/MaterialComponent';
import { deleteDirectoryFromFirebase, deleteFromFirebase, uploadToFirebase } from '@/config/firebase';
import { Material, MaterialDocument, MaterialID } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { getDocumentAsync } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import { PdfProps } from 'react-native-pdf';


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
        else if (str === 'course:material_title_placeholder') return 'Week number';
        else if (str === 'course:edit_material') return 'Edit Material';
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
        else if (str === 'course:upload_material') return 'Upload Material';
        else if (str === 'course:delete') return 'Delete';
        else if (str === 'course:field_required') return 'This field cannot be empty';
        else return str;
    })
);

// Mock of the Firebase modules
jest.mock('@react-native-firebase/auth', () => {
    return () => ({
        currentUser: { uid: 'mocked-uid' },
        signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
        createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
        signOut: jest.fn(() => Promise.resolve()),
    });
});

jest.mock('@react-native-firebase/firestore', () => {
    const mockCollection = jest.fn();
    const mockDoc = jest.fn();
    const mockGet = jest.fn();
    const mockSet = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockOnSnapshot = jest.fn();

    return {
        __esModule: true, // Permet d'utiliser `import` syntaxiquement correct
        default: jest.fn(() => ({
            collection: mockCollection,
            doc: mockDoc,
        })),
        FirebaseFirestoreTypes: {
            FieldValue: {
                serverTimestamp: jest.fn(() => 'MOCK_SERVER_TIMESTAMP'),
                arrayUnion: jest.fn((...args) => args),
                arrayRemove: jest.fn((...args) => args),
            },
        },
        mocks: {
            mockCollection,
            mockDoc,
            mockGet,
            mockSet,
            mockUpdate,
            mockDelete,
            mockOnSnapshot,
        },
    };
});

jest.mock('@react-native-firebase/functions', () => {
    const mockHttpsCallable = jest.fn();

    return {
        __esModule: true, // Permet d'utiliser `import` correctement
        default: jest.fn(() => ({
            httpsCallable: mockHttpsCallable,
        })),
        mocks: {
            mockHttpsCallable,
        },
    };
});

jest.mock('@react-native-firebase/storage', () => {
    const mockRef = jest.fn();
    const mockGetDownloadURL = jest.fn();
    const mockPutFile = jest.fn();
    const mockDelete = jest.fn();

    return {
        __esModule: true, // Permet l'import correct avec `import storage from ...`
        default: jest.fn(() => ({
            ref: mockRef.mockImplementation(() => ({
                getDownloadURL: mockGetDownloadURL,
                putFile: mockPutFile,
                delete: mockDelete,
            })),
        })),
        mocks: {
            mockRef,
            mockGetDownloadURL,
            mockPutFile,
            mockDelete,
        },
    };
});

// Mock of the GoogleSignIn module
jest.mock('@react-native-google-signin/google-signin', () => {
    return {
        GoogleSignin: {
            configure: jest.fn(),
            signIn: jest.fn(() => Promise.resolve({ idToken: 'mockedIdToken' })),
            signOut: jest.fn(() => Promise.resolve()),
            isSignedIn: jest.fn(() => Promise.resolve(true)),
            getTokens: jest.fn(() => Promise.resolve({ accessToken: 'mockedAccessToken' })),
        },
    };
});

//====================== Mock PDF ===========================
jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));
jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: PdfProps) => {
        const { onLoadComplete, onPageChanged } = props;

        React.useEffect(() => {
            if (onLoadComplete) {
                onLoadComplete(10, "1", { height: 100, width: 100 }, []); // Mock total pages as 10 with additional required arguments
            }
        }, [onLoadComplete]);

        React.useEffect(() => {
            if (onPageChanged) {
                onPageChanged(3, 10); // Mock current page as 1 and total pages as 10
            }
        }, [onPageChanged]);

        return React.createElement('Pdf', {
            ...props
        });
    };
});
//==========================================================

jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual('react-native');
    return {
        ...actualReactNative,
        Alert: {
            alert: jest.fn(),
        },
    };
});

jest.mock('@/config/firebase', () => {
    return {
        deleteDirectoryFromFirebase: jest.fn((path: string) => path),
        uploadToFirebase: jest.fn(),
        deleteFromFirebase: jest.fn(),
    };
});

jest.mock('expo-document-picker', () => ({
    EncodingType: {
        Base64: 'base64', // Mock the Base64 encoding type
    },
    getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(), // Mock the function
}));

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
        const screen = render(<MaterialComponent mode='add' courseId='course-id' onSubmit={mockOnSubmit} />);

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

        expect(screen.getByTestId(testIDs.submitTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.submitText).props.children).toBe('Upload Material');
    });

    it('should NOT call onSubmit when the submitTouchableOpacity is pressed but fields not filled', () => {
        const screen = render(<MaterialComponent mode='add' courseId='course-id' onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should call onSubmit when the submitTouchableOpacity is pressed', () => {

        setMockEventType('set');
        const defaultDate1 = new Date(2012, 3, 4, 12, 34, 56);
        const expectedTime1 = defaultDate1.toTimeString().split(':').slice(0, 2).join(':');

        const defaultDate2 = new Date(2012, 3, 9, 12, 34, 56);
        const expectedTime2 = defaultDate2.toTimeString().split(':').slice(0, 2).join(':');

        const screen = render(<MaterialComponent mode='add' courseId='course-id' onSubmit={mockOnSubmit} />);

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

        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('handles dismissed event for DateTimePicker', async () => {
        // Mock the dismissed event
        setMockEventType('dismissed');

        const screen = render(<MaterialComponent mode='add' courseId='course-id' onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.fromDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.fromTimeTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toTimeTouchableOpacity));
    });
});

describe('Edit Material', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function hasTextInChildren(children: any, text: string): boolean {
        if (typeof children === 'string' || typeof children === 'number') {
            return children === text;
        }
        if (Array.isArray(children)) {
            return children.some((child) => hasTextInChildren(child, text));
        }
        if (children && typeof children === 'object' && children.props) {
            return hasTextInChildren(children.props.children, text);
        }
        return false;
    }

    const documents: MaterialDocument[] = [
        { title: 'Document 1', type: 'slide', uri: 'document-1-uri' }
    ];

    const material: { id: MaterialID, data: Material } = {
        id: 'material-id',
        data: {
            title: 'Material 1',
            description: 'This is the first material',
            from: Time.fromDate(new Date(2012, 3, 4, 12, 34, 56)),
            to: Time.fromDate(new Date(2012, 3, 8, 12, 34, 56)),
            docs: documents,
        }
    };

    const mockOnSubmit = jest.fn();
    const mockOnDelete = jest.fn((id: string) => Promise.resolve());

    it('should render the component', () => {
        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

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

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is pressed', async () => {

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.deleteTouchableOpacity));
        await fireEvent.press(screen.getByText('Delete'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'course:confirm_deletion',
            'course:confirm_deletion_text',
            expect.any(Array)
        );
    });

    it('should NOT call onSubmit when the title is empty', () => {

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), '');
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should NOT call onSubmit when the title is too long', () => {

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.changeText(screen.getByTestId(testIDs.titleInput), 'long'.repeat(10));
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should NOT call onSubmit when the description is too long', () => {

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

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

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

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

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        fireEvent.press(screen.getByTestId(testIDs.fromDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.fromTimeTouchableOpacity));

        fireEvent.press(screen.getByTestId(testIDs.toDateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.toTimeTouchableOpacity));
    });

    test('add document feature renders properly', async () => {

        (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
            // Simulate pressing the Delete button
            buttons[1].onPress();
        });

        (deleteDirectoryFromFirebase as jest.Mock).mockImplementation(() => 'mocked-path');

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        expect(screen.getByTestId(testIDs.documentsView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.documentsTitle)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addDocumentButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addDocumentIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.addDocumentText)).toBeTruthy();
        expect(screen.queryByTestId(testIDs.addDocumentView)).toBeNull();
        expect(screen.queryByTestId(testIDs.docTitleInput)).toBeNull();
        expect(screen.queryByTestId(testIDs.docTypeInput)).toBeNull();
        expect(screen.queryByTestId(testIDs.browseView)).toBeNull();
        expect(screen.queryByTestId(testIDs.browseTouchableOpacity)).toBeNull();
        expect(screen.queryByTestId(testIDs.browseIcon)).toBeNull();
        expect(screen.queryByTestId(testIDs.browseText)).toBeNull();
        expect(screen.queryByTestId(testIDs.fileName)).toBeNull();
        expect(screen.queryByTestId(testIDs.saveUploadButton)).toBeNull();
        expect(screen.getByTestId(testIDs.documentsDisplay)).toBeTruthy();
        fireEvent.press(screen.getByTestId(testIDs.addDocumentButton));

        expect(screen.getByTestId(testIDs.addDocumentView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.docTitleInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.docTypeInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.browseView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.browseTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.browseIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.browseText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.fileName)).toBeTruthy();
        expect(screen.getByTestId(testIDs.saveUploadButton)).toBeTruthy();

        expect(hasTextInChildren(screen.getByTestId(testIDs.docTypeInput).props.children, 'slide')).toBe(true);
        fireEvent.press(screen.getByTestId(testIDs.docTypeInput));
        expect(hasTextInChildren(screen.getByTestId(testIDs.docTypeInput).props.children, 'exercise')).toBe(true);

        // Simulate clicking the "Delete" button
        fireEvent.press(screen.getByTestId(testIDs.deleteTouchableOpacity));

        // Verify Alert.alert is called with correct arguments
        expect(Alert.alert).toHaveBeenCalledWith(
            'course:confirm_deletion',
            'course:confirm_deletion_text',
            expect.any(Array)
        );

        // Verify onDelete and deleteDirectoryFromFirebase were called
        expect(mockOnDelete).toHaveBeenCalledWith(material.id);
        await waitFor(() => {
            expect(deleteDirectoryFromFirebase).toHaveBeenCalledWith(`courses/course-id/materials/${material.id}`);
        });
    });

    test('Try to delete a document', async () => {

        (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
            // Simulate pressing the Delete button
            buttons[1].onPress();
        });
        (deleteDirectoryFromFirebase as jest.Mock).mockImplementation(() => {
            throw new Error('mocked error');
        });
        const logSpy = jest.spyOn(console, 'error').mockImplementation();

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        // Simulate clicking the "Delete" button
        fireEvent.press(screen.getByTestId(testIDs.deleteTouchableOpacity));
        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('Error deleting material:', new Error('mocked error'));
        });
        logSpy.mockRestore();
    });

    test('deletes a document properly', async () => {

        const logSpy = jest.spyOn(console, 'log').mockImplementation();

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={mockOnSubmit} onDelete={mockOnDelete} />);

        // Simulate clicking the "Delete" button
        fireEvent.press(screen.getByTestId('delete'));
        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('click on Document 1');
        });
        logSpy.mockRestore();
    });

    test('click on Upload Material when documentFields are Empty', async () => {

        const onSubmitMock = jest.fn((material: Material, id: string, func) => func(id));

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={onSubmitMock} onDelete={mockOnDelete} />);

        // Simulate clicking the "Delete" button
        fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity));
        expect(onSubmitMock).toHaveBeenCalled();
    });

    test('click on Upload Material when documentFields are Non-Empty', async () => {

        jest.clearAllMocks();
        (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
            // Simulate pressing the Delete button
            buttons[1].onPress();
        });
        (deleteFromFirebase as jest.Mock).mockImplementation(() => 'mocked-delete-from-firebase');
        (uploadToFirebase as jest.Mock).mockImplementation(() => Promise.resolve('_'));
        (getDocumentAsync as jest.Mock).mockImplementation(() => { return { canceled: false, assets: [{ uri: 'uri_mocked', name: 'doc_name.pdf' }] } });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mocked-data');
        const onSubmitMock = jest.fn((material: Material, id: string, func) => func(id));
        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        (deleteDirectoryFromFirebase as jest.Mock).mockImplementation(() => 'mocked-path');

        const documentsDataMock = [{ uri: 'doc_name.pdf', dataBase64: 'mocked-data' }];
        const deletedDocsMock = [material.data.docs[0]]


        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={onSubmitMock} onDelete={mockOnDelete} />);

        // Simulate deleting the existing document
        fireEvent.press(screen.getByTestId('delete'));
        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('click on Document 1');
        });

        // Simulate clicking the "Add Document" button
        fireEvent.press(screen.getByTestId(testIDs.addDocumentButton));

        // Fill doc fields
        // Fill document title
        fireEvent.changeText(screen.getByTestId(testIDs.docTitleInput), 'New Document Title');
        // Select document
        fireEvent.press(screen.getByTestId(testIDs.browseTouchableOpacity));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Opening file picker...'));
        await waitFor(() => expect(getDocumentAsync).toHaveBeenCalled());
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Selected File :', 'doc_name.pdf'));
        expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('uri_mocked', {
            encoding: 'base64',
        });
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Encoded File Data ready to be uploaded.'));

        // Save document
        fireEvent.press(screen.getByTestId(testIDs.saveUploadButton));

        // Submit changes
        await waitFor(() => fireEvent.press(screen.getByTestId(testIDs.submitTouchableOpacity)));
        await waitFor(() => expect(onSubmitMock).toHaveBeenCalled());
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Uploading documents...'));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Documents to upload:', documentsDataMock));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Documents to delete:', deletedDocsMock));
        // The deleted file should be deleted from Firebase
        await waitFor(() => expect(uploadToFirebase).toHaveBeenCalledWith('doc_name.pdf', 'mocked-data', `courses/course-id/materials/material-id`));
        // The new file should be uploaded to Firebase
        await waitFor(() => expect(deleteFromFirebase).toHaveBeenCalledWith('courses/course-id/materials/material-id', 'document-1-uri'));
    });

    test('when user canceled file picking', async () => {

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const onSubmitMock = jest.fn((material: Material, id: string, func) => func(id));
        (getDocumentAsync as jest.Mock).mockImplementation(() => { return { canceled: true, assets: [{ uri: 'uri_mocked', name: 'doc_name.pdf' }] } });

        const screen = render(<MaterialComponent mode='edit' courseId='course-id' material={material} onSubmit={onSubmitMock} onDelete={mockOnDelete} />);

        // Simulate clicking the "Add Document" button
        fireEvent.press(screen.getByTestId(testIDs.addDocumentButton));

        // Browse for a document
        fireEvent.press(screen.getByTestId(testIDs.browseTouchableOpacity));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Opening file picker...'));

        // Verify the document picker was canceled
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('File selection cancelled.'));
    });
});