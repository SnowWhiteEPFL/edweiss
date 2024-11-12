import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Timestamp } from '@/model/time';
import Todolist from '@/model/todo';
import { Time as OurTime } from '@/utils/time';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export async function saveTodo(name: string, dueDate: Timestamp, description: string) {
    try {
        const res = await callFunction(
            Todolist.Functions.createTodo,
            { name, description, dueDate: OurTime.toDate(dueDate).toISOString(), status: "yet" });
        if (res.status) {
            router.back();
            Toast.show({ type: 'success', text1: t(`course:toast_added_to_todo_text1`), text2: t(`course:toast_added_to_todo_text2`) });
        }
        else { Toast.show({ type: 'error', text1: t(`todo:error_toast_title`), text2: t(`todo:couldnot_save_toast`) }); }
    }
    catch (error) { Toast.show({ type: 'error', text1: t(`todo:error_toast_title`), text2: t(`todo:couldnot_save_toast`) }); }
}