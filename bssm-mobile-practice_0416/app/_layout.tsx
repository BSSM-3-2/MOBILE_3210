import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@components/themed-text';
import { Platform, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { usePushRegistration } from '@/hooks/use-push-registration';

const IS_EXPO_GO_ANDROID =
    Platform.OS === 'android' &&
    (Constants.executionEnvironment === 'storeClient' ||
        Constants.appOwnership === 'expo');

// TODO 실습 5-1
// setNotificationHandler로 Foreground 배너를 활성화하세요
// shouldShowAlert, shouldPlaySound 옵션 값을 채워보세요
if (!IS_EXPO_GO_ANDROID) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(tabs)',
};

const AUTH_ROUTES = new Set(['login', 'signup']);

function AuthGuard() {
    const { accessToken } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    usePushRegistration();

    useEffect(() => {
        if (IS_EXPO_GO_ANDROID) return;

        let receivedSub: { remove: () => void } | null = null;
        let responseSub: { remove: () => void } | null = null;
        let isMounted = true;

        const bindNotifications = async () => {
            const Notifications = await import('expo-notifications');
            if (!isMounted) return;

        // TODO 실습 7-1
        // addNotificationReceivedListener로 Foreground 수신 이벤트 구독
            receivedSub = Notifications.addNotificationReceivedListener(
                notification => {
                    console.log('[Push][Foreground] received:', notification);
                },
            );

        // TODO 실습 7-2
        // addNotificationResponseReceivedListener로 알림 탭 이벤트 구독
            responseSub = Notifications.addNotificationResponseReceivedListener(
                response => {
                    console.log(
                        '[Push][Background] response:',
                        response.notification.request.content.data,
                    );
                },
            );

        // TODO 실습 7-3
        // getLastNotificationResponseAsync로 Killed 상태 진입 데이터 확인
            const response =
                await Notifications.getLastNotificationResponseAsync();
            if (!response) return;
            console.log(
                '[Push][Killed] last response:',
                response.notification.request.content.data,
            );
        };

        bindNotifications();

        // TODO 실습 7-4 (return)
        // 리스너 클린업 — sub.remove() 호출
        return () => {
            isMounted = false;
            receivedSub?.remove();
            responseSub?.remove();
        };
    }, []);

    useEffect(() => {
        const currentRoute = segments[0] as string | undefined;
        const inAuthRoute = AUTH_ROUTES.has(currentRoute ?? '');

        if (!accessToken && !inAuthRoute) {
            router.replace('/login' as never);
        } else if (accessToken && inAuthRoute) {
            router.replace('/(tabs)');
        }
    }, [accessToken, segments]);

    return null;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
        'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
        'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
        'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
        'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                <AuthGuard />
                <Stack>
                    <Stack.Screen
                        name='(tabs)'
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='create'
                        options={{
                            headerShown: false,
                            animation: 'slide_from_right',
                        }}
                    />
                    <Stack.Screen
                        name='signup'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    회원가입
                                </ThemedText>
                            ),
                            headerBackTitle: '뒤로',
                        }}
                    />
                    <Stack.Screen
                        name='login'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    로그인
                                </ThemedText>
                            ),
                            headerBackTitle: '뒤로',
                        }}
                    />
                    <Stack.Screen
                        name='profile/[id]'
                        options={{
                            headerShown: true,
                            headerTitle: () => (
                                <ThemedText style={styles.default}>
                                    사용자 프로필
                                </ThemedText>
                            ),
                            headerBackTitle: '홈으로',
                        }}
                    />
                </Stack>
                <StatusBar style='auto' />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 19,
        fontFamily: 'Pretendard-Bold',
    },
});
