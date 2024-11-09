/**
 * @file utilsFunctions.test.tsx
 * @description Test suite for utils function used in the context of a todo
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import Todolist from '@/model/todo';
import Toast from 'react-native-toast-message';
import { sameTodos, statusColorMap, statusIconMap, statusNextAction, statusNextMap, toogleArchivityOfTodo } from '../../../utils/todo/utilsFunctions';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

// Firebase callfunction and to do collection for anonymous user
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { todos: 'users/anonymous/todos' }
}));

// Firebase auth module to anonymous user
jest.mock('@react-native-firebase/auth', () => {
    return {
        currentUser: { uid: 'anonymous' },
        signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous' } }))
    };
});

// Firestore containing the database 
jest.mock('@react-native-firebase/firestore', () => {
    return {
        __esModule: true,
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

// Firebase http callable functions
jest.mock('@react-native-firebase/functions', () => {
    return {
        httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: { status: true } })))
    };
});

// Firebase Storage module
jest.mock('@react-native-firebase/storage', () => {
    return {
        ref: jest.fn(() => ({
            putFile: jest.fn(() => Promise.resolve({})),
            getDownloadURL: jest.fn(() => Promise.resolve('mocked_download_url')),
            delete: jest.fn(() => Promise.resolve({}))
        })),
    };
});

// Google Signin module
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'mockedUserId', name: 'Mocked User' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(false)),
    },
}));

// Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn()
}));

// Silence console.error for native module warnings
jest.spyOn(console, 'error').mockImplementation((message) => {
    if (message.includes('Invariant Violation')) return;
    console.error(message);
});


// ------------------------------------------------------------
// ----------     To do utils functions  Test suite     -------
// ------------------------------------------------------------

describe("Utility Function Tests suite", () => {

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
});



// ------------------------------------------------------------
// -----------     Status Next Actions Test suite     ---------
// ------------------------------------------------------------

describe("statusNextAction function Tests suite", () => {
    const todoMock: Todolist.Todo = { name: "Sample Todo", status: "yet" };

    // Clean all mocks before test starts
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Restore all previously set mock on test completion
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

// ------------------------------------------------------------
// ---------      Toogle To Do Archivity Test suite    --------
// ------------------------------------------------------------

describe("toogleArchivityOfTodo function", () => {
    const todoMock: Todolist.Todo = { name: "Sample Todo", status: "yet" };

    // Clean all mocks before test starts
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

// ------------------------------------------------------------
// ---------------    Same To Do  Test suite      -------------
// ------------------------------------------------------------

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