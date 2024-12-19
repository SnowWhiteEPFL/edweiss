/**
 * @file notifsActionsFunctions.test.tsx
 * @description Test file for the notification action functions
 * @author Florian Dinant
 */

import { callFunction } from '@/config/firebase';
import NotifList from '@/model/notifs';
import { deleteNotifAction, markAsReadAction, markAsUnreadAction, pushNotifAction } from '@/utils/notifs/notifsActionsFunctions';


// Mock the callFunction function
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));


// Tests
describe('Notification Action Functions', () => {

    // Mock data
    const mockId = 'test-id';
    const mockType = 'info';
    const mockTitle = 'Test Notification';
    const mockMessage = 'This is a test notification message.';
    const mockCourseID = 'course-id';

    // Reset mocks before each test
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
            await pushNotifAction(mockType, mockTitle, mockMessage, mockCourseID);
            expect(callFunction).toHaveBeenCalledWith(NotifList.Functions.pushNotif, {
                type: mockType,
                title: mockTitle,
                message: mockMessage,
                courseID: mockCourseID,
            });
        });

        it('should log a message if pushing notification fails (status 0)', async () => {
            (callFunction as jest.Mock).mockResolvedValue({ status: 0 });
            console.log = jest.fn();
            await pushNotifAction(mockType, mockTitle, mockMessage, mockCourseID);
            expect(console.log).toHaveBeenCalledWith('Notification failed to push');
        });

        it('should log an error if callFunction throws an error', async () => {
            const mockError = new Error('Test error');
            (callFunction as jest.Mock).mockRejectedValue(mockError);
            console.error = jest.fn();
            await pushNotifAction(mockType, mockTitle, mockMessage, mockCourseID);
            expect(console.error).toHaveBeenCalledWith('Error pushing notification:', mockError);
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
