import { callFunction } from '@/config/firebase';
import Todolist from '@/model/todo';
import Toast from 'react-native-toast-message';
import { sameTodos, statusColorMap, statusIconMap, statusNextAction, statusNextMap, toogleArchivityOfTodo } from '../../utils/todo/utilsFunctions';

jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true, // This ensures it's treated as a module with a default export
    default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { todos: 'users/anonymous/todos' }
}));

// Mock Firebase auth module
jest.mock('@react-native-firebase/auth', () => {
    return {
        currentUser: { uid: 'anonymous' },  // Mock anonymous user
        signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous' } }))
    };
});

// Mock Firestore module correctly
jest.mock('@react-native-firebase/firestore', () => {
    return {
        // Mock Firestore to return an object with a collection method
        __esModule: true, // This is necessary for the default import to work
        default: jest.fn(() => ({
            collection: jest.fn((path) => {
                if (path === 'users/anonymous/todos') {
                    return {
                        doc: jest.fn((id) => ({
                            set: jest.fn(() => Promise.resolve({})),
                            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ name: 'Sample Todo', status: 'yet' }) })),
                            update: jest.fn(() => Promise.resolve({})),
                        })),
                        add: jest.fn(() => Promise.resolve({ id: '1' })),
                        get: jest.fn(() => Promise.resolve({
                            docs: [
                                { id: '1', data: () => ({ name: 'Sample Todo', status: 'yet' }) },
                            ],
                        })),
                    };
                }
                return {
                    doc: jest.fn(),
                    add: jest.fn(),
                    get: jest.fn(),
                };
            }),
        })),
    };
});

// Mock Firebase functions
jest.mock('@react-native-firebase/functions', () => {
    return {
        httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: { status: true } })))
    };
});

// Mock Storage module
jest.mock('@react-native-firebase/storage', () => {
    return {
        ref: jest.fn(() => ({
            putFile: jest.fn(() => Promise.resolve({})),
            getDownloadURL: jest.fn(() => Promise.resolve('mocked_download_url')),
            delete: jest.fn(() => Promise.resolve({}))
        })),
    };
});

// Mock Google Signin module
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'mockedUserId', name: 'Mocked User' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(false)),
    },
}));

// Mock Toast to prevent UI interference
jest.mock('react-native-toast-message', () => ({
    show: jest.fn()
}));

// Silence console.error for native module warnings
jest.spyOn(console, 'error').mockImplementation((message) => {
    if (message.includes('Invariant Violation')) return;
    console.error(message);
});

// Testing utility functions
describe("Utility Function Tests", () => {
    // Mapping Tests
    it("should return correct icons for each todo status", () => {
        expect(statusIconMap.yet).toBe("alert-circle");
        expect(statusIconMap.in_progress).toBe("construct");
        expect(statusIconMap.done).toBe("checkmark-done-circle");
        expect(statusIconMap.archived).toBe("archive");
    });

    it("should return correct colors for each todo status", () => {
        expect(statusColorMap.yet).toBe("red");
        expect(statusColorMap.in_progress).toBe("yellow");
        expect(statusColorMap.done).toBe("green");
        expect(statusColorMap.archived).toBe("overlay0");
    });

    it("should return next status correctly", () => {
        expect(statusNextMap.yet).toBe("in_progress");
        expect(statusNextMap.in_progress).toBe("done");
        expect(statusNextMap.done).toBe("yet");
        expect(statusNextMap.archived).toBe("archived");
    });

    // statusNextAction Tests
    describe("statusNextAction function", () => {
        const todoMock: Todolist.Todo = { name: "Sample Todo", status: "yet" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        afterEach(() =>
            jest.restoreAllMocks()
        );

        it("should show success toast on successful update", async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: true });

            await statusNextAction("1", todoMock);

            expect(callFunction).toHaveBeenCalledWith(
                {
                    exportedName: "todolist_updateTodo",
                    originalName: "updateTodo",
                    path: "todolist/updateTodo"
                },
                { id: "1", status: "in_progress" }
            );
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
        });

        it("should show error toast on failed update", async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: false });

            await statusNextAction("1", todoMock);

            expect(callFunction).toHaveBeenCalledWith(
                {
                    exportedName: "todolist_updateTodo",
                    originalName: "updateTodo",
                    path: "todolist/updateTodo"
                },
                { id: "1", status: "in_progress" }
            );
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
        });

        it("should handle errors and show error toast", async () => {
            (callFunction as jest.Mock).mockRejectedValue(new Error("Update failed"));

            await statusNextAction("1", todoMock);

            expect(callFunction).toHaveBeenCalledWith(
                {
                    exportedName: "todolist_updateTodo",
                    originalName: "updateTodo",
                    path: "todolist/updateTodo"
                },
                { id: "1", status: "in_progress" }
            );
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
        });
    });

    // toogleArchivityOfTodo Tests
    describe("toogleArchivityOfTodo function", () => {
        const todoMock: Todolist.Todo = { name: "Sample Todo", status: "yet" };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should archive a todo and show success toast", async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: true });

            await toogleArchivityOfTodo("1", todoMock);

            expect(callFunction).toHaveBeenCalledWith(
                {
                    exportedName: "todolist_updateTodo",
                    originalName: "updateTodo",
                    path: "todolist/updateTodo"
                },
                { id: "1", status: "archived" }
            );
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
        });

        it("should unarchive a todo and show success toast", async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: true });

            await toogleArchivityOfTodo("1", { ...todoMock, status: "archived" });

            expect(callFunction).toHaveBeenCalledWith(
                {
                    exportedName: "todolist_updateTodo",
                    originalName: "updateTodo",
                    path: "todolist/updateTodo"
                },
                { id: "1", status: "yet" }
            );
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
        });
    });

    // sameTodos Function Tests
    describe("sameTodos function", () => {
        const todo1: Todolist.Todo = { name: "Sample Todo", description: "Description", status: "yet" };
        const todo2 = { ...todo1 };
        const todo3 = { ...todo1, name: "Different Todo" };

        it("should return true for identical todos", () => {
            expect(sameTodos(todo1, todo2)).toBe(true);
        });

        it("should return false for non-identical todos", () => {
            expect(sameTodos(todo1, todo3)).toBe(false);
        });
    });
});