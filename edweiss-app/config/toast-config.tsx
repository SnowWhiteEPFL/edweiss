import { BaseToast, ToastConfig } from 'react-native-toast-message';

const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}

            style={{ borderLeftColor: '#65c674' /*, width: '90%' */ }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontWeight: 'bold'
            }}
            text2Style={{
                fontSize: 14,
                fontWeight: 'regular'
            }}
        />
    ),

    error: (props: any) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#ff6100' /*, width: '90%' */ }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontWeight: 'bold'
            }}
            text2Style={{
                fontSize: 14,
                fontWeight: 'regular'
            }}
        />
    ),
};

export default toastConfig;