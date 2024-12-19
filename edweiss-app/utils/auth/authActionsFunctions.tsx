import { callFunction } from '@/config/firebase';
import { Auth } from '@/model/users';
import Toast from 'react-native-toast-message';

export async function switchPermissionsAction() {
    const res = await callFunction(Auth.Functions.switchPermissions, {});
    if (res.status != 1) {
        console.error(res.error);
        Toast.show({
            type: 'error',
            text1: "Permission switch failed",
        });
        return { ...res, error: new Error(res.error) };
    }
    Toast.show({
        type: 'success',
        text1: "You have switched permissions",
    });
    return res;
}

