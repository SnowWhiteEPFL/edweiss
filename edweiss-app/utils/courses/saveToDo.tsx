import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Timestamp } from '@/model/time';
import Todolist from '@/model/todo';
import { Time as OurTime } from '@/utils/time';
import Toast from 'react-native-toast-message';

export async function saveTodo(name: string, dueDate: Timestamp, description: string) {
    try {
        const res = await callFunction(Todolist.Functions.createTodo, {
            name, description, dueDate: OurTime.toDate(dueDate).toISOString(), status: "yet"
        });

        if (res.status) {
            Toast.show({
                type: 'success',
                text1: t(`course:toast_added_to_todo_text1`),
                text2: t(`course:toast_added_to_todo_text2`)
            });
        } else if (res.error === "duplicate_todo") {
            Toast.show({
                type: 'info',
                text1: t(`todo:already_existing_todo_toast_title`),
                text2: t(`todo:already_existing_todo_toast_funny`)
            });
        } else {
            showToastError();
        }
    } catch (error) {
        showToastError();
    }
}

const showToastError = () => {
    Toast.show({
        type: 'error',
        text1: t(`todo:error_toast_title`),
        text2: t(`todo:couldnot_save_toast`)
    });
};