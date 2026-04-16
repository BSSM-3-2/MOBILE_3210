import { useEffect } from 'react';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { registerPushDevice } from '@/api/push';

/**
 * 로그인된 상태에서 Expo push token을 얻어 서버에 등록합니다.
 * accessToken이 생기는 순간(로그인/회원가입 직후) 자동으로 실행됩니다.
 */
export function usePushRegistration() {
    const accessToken = useAuthStore(s => s.accessToken);

    useEffect(() => {
        if (!accessToken) return;
        registerDevice();
    }, [accessToken]);
}

async function registerDevice() {

    // 실기기가 아니면 Expo push token을 발급받을 수 없음
    if (!Device.isDevice) {
        console.log('[Push] Expo Push Token은 실기기에서만 발급됩니다.');
        return;
    }

    const Notifications = await import('expo-notifications');

    // TODO 실습 8-1
    // setNotificationChannelAsync로 Android 알림 채널을 생성하세요
    // name, importance 등을 지정하고, importance 값을 바꿔가며 heads-up 동작을 비교해보세요
    if (Platform.OS === 'android') {
        const pushChannelImportance = Notifications.AndroidImportance.MAX;

        await Notifications.setNotificationChannelAsync('default', {
            name: '원격 푸시 알림',
            importance: pushChannelImportance,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#0095F6',
            showBadge: true,
            sound: 'default',
        });

        console.log('[Push] Android 채널 생성/확인:', 'default');
    }

    // TODO 실습 4-1
    // getPermissionsAsync로 현재 권한 상태를 확인하고
    // 미허용 시 requestPermissionsAsync로 사용자에게 요청하세요
    // 최종적으로 granted가 아니면 return 처리하세요
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] 알림 권한이 허용되지 않았습니다.');
        return;
    }

    // TODO 실습 4-2
    // getExpoPushTokenAsync로 Expo Push Token을 발급받고
    // registerPushDevice(token)으로 서버에 전송하세요
    const projectId =
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
        console.log(
            '[Push] EAS projectId를 찾을 수 없습니다. app.json의 expo.extra.eas.projectId를 설정하세요.',
        );
        return;
    }

    try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        console.log('[Push] Expo Push Token:', tokenResponse.data);
        await registerPushDevice(tokenResponse.data);
    } catch (error) {
        console.log('[Push] Expo Push Token 발급 실패:', error);
    }
}
