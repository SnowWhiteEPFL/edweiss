import { callFunction } from '@/config/firebase';
import NotifList from '@/model/notifs';
import { deleteNotifAction, markAsReadAction, markAsUnreadAction, pushNotifAction } from '@/utils/notifs/notifsActionsFunctions';

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

describe('Notification Action Functions', () => {
    const mockId = 'test-id';
    const mockType = 'info';
    const mockTitle = 'Test Notification';
    const mockMessage = 'This is a test notification message.';
    const mockRead = false;
    const mockCourseID = 'course-id';
    const mockDate = '2023-11-12T10:00:00Z';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('markAsUnreadAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await markAsUnreadAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.markAsUnread, { id: mockId });
        });

        it('should log a message if marking as unread fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.log = jest.fn();
            await markAsUnreadAction(mockId);
            expect(console.log).toHaveBeenCalledWith('Notification failed to mark as unread');
        });

        it('should not call callFunction if id is invalid', async () => {
            await markAsUnreadAction('');
            await markAsUnreadAction(null as unknown as string);
            expect(callFunction).not.toHaveBeenCalled();
        });
    });

    describe('markAsReadAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await markAsReadAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.markAsRead, { id: mockId });
        });

        it('should log a message if marking as read fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.log = jest.fn();
            await markAsReadAction(mockId);
            expect(console.log).toHaveBeenCalledWith('Notification failed to mark as read');
        });

        it('should not call callFunction if id is invalid', async () => {
            await markAsReadAction('');
            await markAsReadAction(null as unknown as string);
            expect(callFunction).not.toHaveBeenCalled();
        });
    });

    describe('pushNotifAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
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

        it('should log a message if pushing notification fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.log = jest.fn();
            await pushNotifAction(mockId, mockType, mockTitle, mockMessage, mockRead, mockCourseID, mockDate);
            expect(console.log).toHaveBeenCalledWith('Notification failed to push');
        });

        it('should log an error if callFunction throws an error', async () => {
            const mockError = new Error('Test error');
            (callFunction as jest.Mock).mockRejectedValue(mockError);
            console.error = jest.fn();
            await pushNotifAction(mockId, mockType, mockTitle, mockMessage, mockRead, mockCourseID, mockDate);
            expect(console.error).toHaveBeenCalledWith('Error pushing notification:', mockError);
        });

        it('should not call callFunction if id is invalid', async () => {
            await pushNotifAction('', mockType, mockTitle, mockMessage, mockRead, mockCourseID, mockDate);
            await pushNotifAction(null as unknown as string, mockType, mockTitle, mockMessage, mockRead, mockCourseID, mockDate);
            expect(callFunction).not.toHaveBeenCalled();
        });
    });

    describe('deleteNotifAction', () => {
        it('should call callFunction with the correct parameters', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 1 });
            await deleteNotifAction(mockId);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.deleteNotif, { id: mockId });
        });

        it('should log a message if deleting notification fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.log = jest.fn();
            await deleteNotifAction(mockId);
            expect(console.log).toHaveBeenCalledWith('Notification failed to delete');
        });

        it('should not call callFunction if id is invalid', async () => {
            await deleteNotifAction('');
            await deleteNotifAction(null as unknown as string);
            expect(callFunction).not.toHaveBeenCalled();
        });
    });
});
