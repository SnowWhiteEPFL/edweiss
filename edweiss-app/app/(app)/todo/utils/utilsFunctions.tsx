/**
 * @file utilsFunctions.tsx
 * @description Utility functions for managing todo items in the application
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import Todolist from '@/model/todo';
import Toast from 'react-native-toast-message';

import Todo = Todolist.Todo;
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


// ------------------------------------------------------------
// -------------------  Todo Utils Functions   ----------------
// ------------------------------------------------------------

export const statusIconMap: Record<TodoStatus, IconType> = {
    yet: "alert-circle",
    in_progress: "construct",
    done: "checkmark-done-circle",
    archived: "archive"
};

export const statusColorMap: Record<TodoStatus, Color> = {
    yet: "red",
    in_progress: "yellow",
    done: "green",
    archived: "overlay0"

};

export const statusNextMap: Record<TodoStatus, TodoStatus> = {
    yet: 'in_progress',
    in_progress: 'done',
    done: 'yet',
    archived: 'archived'
};

export const statusNextAction = async (id: string, todo: Todo) => {
    const newTodo = {
        ...todo,
        status: statusNextMap[todo.status]
    };
    try {

        const res = await callFunction(Functions.updateTodo, { id, newTodo });

        if (res.status) {
            console.log('Todo updated successfully');
        } else {
            console.error('Failed to update todo:', res.error);
        }
    } catch (error) {
        console.error('Error updating todo:', error);
    }
};

export const toogleArchivityOfTodo = async (id: string, todo: Todo) => {
    const newTodo = {
        ...todo,
        status: todo.status !== "archived" ? "archived" : "yet"
    };
    try {

        const res = await callFunction(Functions.updateTodo, { id, newTodo });

        if (res.status) {
            Toast.show({
                type: 'success',
                text1: todo.name + " was " + (todo.status !== "archived" ? t(`todo:archived_success_toast`) : t(`todo:unarchived_success_toast`)),
                text2: todo.status !== "archived" ? t(`todo:archived_success_toast_sub`) : t(`todo:unarchived_success_toast_sub`),
            });

        } else {
            console.error('Failed to update todo:', res.error);
        }
    } catch (error) {
        console.error('Error updating todo:', error);
    }
};


export const sameTodos = (todo1: Todo, todo2: Todo): boolean => {
    return todo1.name === todo2.name && todo1.description === todo2.description && todo1.status === todo2.status;
};;