import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@components/themed-text';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { usePushRegistration } from '@/hooks/use-push-registration';
import * as Notifications from 'expo-notifications';

Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: __DEV__ ? 'dev' : 'prod',
    tracesSampleRate: 0.1,
    enabled: !__DEV__,
});

// 포그라운드에서도 알림 배너가 보이도록 설정
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    anchor: '(tabs)',
};

const AUTH_ROUTES = new Set(['login', 'signup']);

function AuthGuard() {
    const { accessToken, status } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    usePushRegistration();

    useEffect(() => {
        // checking 중에는 라우팅하지 않음 — Splash가 유지되는 동안 대기
        if (status === 'checking') return;

        const currentRoute = segments[0] as string | undefined;
        const inAuthRoute = AUTH_ROUTES.has(currentRoute ?? '');

        if (!accessToken && !inAuthRoute) {
            router.replace('/login' as never);
        } else if (accessToken && inAuthRoute) {
            router.replace('/(tabs)');
        }
    }, [accessToken, status, segments]);

    return null;
}

export default function RootLayout() {
    const { bootstrap } = useAuthStore();
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
        'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
        'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
        'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
        'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
    });

    // 앱 시작 시 한 번 — SecureStore 토큰 조회 → 서버 검증 → status 결정
    useEffect(() => {
        bootstrap();
    }, []);

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync();
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
                {/* TODO 2. 전역 ErrorBoundary로 AuthGuard와 Stack 전체를 감싸세요.
                    onError: err => console.error('[GlobalBoundary]', err.message) */}
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
