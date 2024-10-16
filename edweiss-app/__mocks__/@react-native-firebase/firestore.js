const firestore = {
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            onSnapshot: jest.fn(),
        })),
    })),
    doc: jest.fn(),
    onSnapshot: jest.fn(),
};

export default firestore;
