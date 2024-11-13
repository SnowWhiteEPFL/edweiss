// __tests__/notifsActionsFunctions.test.tsx
import { callFunction } from '@/config/firebase';
import NotifList from '@/model/notifs';
import { deleteNotifAction, markAsReadAction, markAsUnreadAction, pushNotifAction } from '@/utils/notifs/notifsActionsFunctions';

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

describe('notifsActionsFunctions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('markAsUnreadAction', () => {
        it('should not call callFunction if id is empty', async () => {
            await markAsUnreadAction('');
            expect(callFunction).not.toHaveBeenCalled();
        });

        it('should call callFunction with correct parameters if id is provided', async () => {
            const mockId = '123';
            await markAsUnreadAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.markAsUnread, { id: mockId });
        });
    });

    describe('markAsReadAction', () => {
        it('should not call callFunction if id is empty', async () => {
            await markAsReadAction('');
            expect(callFunction).not.toHaveBeenCalled();
        });

        it('should call callFunction with correct parameters if id is provided', async () => {
            const mockId = '123';
            await markAsReadAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.markAsRead, { id: mockId });
        });
    });

    describe('pushNotifAction', () => {
        const mockId = '123';
        const mockType = 'info';
        const mockTitle = 'Test Notification';
        const mockMessage = 'This is a test message';
        const mockRead = false;
        const mockCourseID = 'course_1';
        const mockDate = '2023-10-10';

        it('should not call callFunction if id is empty', async () => {
            await pushNotifAction('', mockType, mockTitle, mockMessage, mockRead);
            expect(callFunction).not.toHaveBeenCalled();
        });

        it('should call callFunction with correct parameters when all arguments are provided', async () => {
            await pushNotifAction(mockId, mockType, mockTitle, mockMessage, mockRead, mockCourseID, mockDate);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.pushNotif, {
                type: mockType,
                title: mockTitle,
                message: mockMessage,
                date: mockDate,
                read: mockRead,
                courseID: mockCourseID,
            });
        });

        it('should call console.log if response status is 0', async () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            (callFunction as jest.Mock).mockResolvedValueOnce({ status: 0 });

            await pushNotifAction(mockId, mockType, mockTitle, mockMessage, mockRead);
            expect(logSpy).toHaveBeenCalledWith('Notification failed to push');
            logSpy.mockRestore();
        });

        it('should call console.error if callFunction throws an error', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (callFunction as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

            await pushNotifAction(mockId, mockType, mockTitle, mockMessage, mockRead);
            expect(errorSpy).toHaveBeenCalledWith('Error pushing notification:', expect.any(Error));
            errorSpy.mockRestore();
        });
    });

    describe('deleteNotifAction', () => {
        it('should not call callFunction if id is empty', async () => {
            await deleteNotifAction('');
            expect(callFunction).not.toHaveBeenCalled();
        });

        it('should call callFunction with correct parameters if id is provided', async () => {
            const mockId = '123';
            await deleteNotifAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.deleteNotif, { id: mockId });
        });
    });
});