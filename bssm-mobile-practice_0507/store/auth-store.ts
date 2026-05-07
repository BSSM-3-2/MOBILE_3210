import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import User from '@type/User';
import {
    signup,
    login,
    logout as authLogout,
    refreshToken as authRefresh,
    SignupPayload,
    LoginPayload,
} from '@/api/auth';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: AuthStatus;
    loading: boolean;
    error: string | null;

    bootstrap: () => Promise<void>;
    signUp: (payload: SignupPayload) => Promise<void>;
    logIn: (payload: LoginPayload) => Promise<void>;
    logOut: () => Promise<void>;
    refreshAccessToken: () => Promise<string>;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'checking',
    loading: false,
    error: null,

    // 앱 시작 시 한 번 호출 — 저장된 토큰으로 세션 복원
    bootstrap: async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (!token) {
                set({ status: 'guest' });
                return;
            }

            // store에 임시 세팅해야 apiClient interceptor가 Bearer 헤더를 붙임
            set({ accessToken: token });

            // 저장된 토큰이 있다는 것과 유효하다는 것은 다르다
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { getMe } = require('@/api/users');
            const user = await getMe();

            const storedRefreshToken =
                await SecureStore.getItemAsync(REFRESH_KEY);
            set({
                user,
                accessToken: token,
                refreshToken: storedRefreshToken,
                status: 'authenticated',
            });
        } catch {
            // 만료·폐기된 토큰은 즉시 제거
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_KEY);
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                status: 'guest',
            });
        }
    },

    signUp: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await signup(payload);
            await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
            await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '회원가입에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    logIn: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await login(payload);
            await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
            await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '로그인에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    // SecureStore 삭제 → store 초기화 순서 반드시 지키기
    logOut: async () => {
        const currentRefreshToken = get().refreshToken;

        // 서버에 refresh token 폐기 요청 — 실패해도 로컬 정리는 반드시 진행
        if (currentRefreshToken) {
            authLogout(currentRefreshToken).catch(() => {});
        }

        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            status: 'guest',
            error: null,
        });
    },

    // 401 발생 시 client.ts 인터셉터에서 호출 — 새 accessToken 반환
    refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) throw new Error('No refresh token');

        const res = await authRefresh(currentRefreshToken);

        await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);
        set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
        });

        return res.accessToken;
    },

    setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
    },

    clearError: () => set({ error: null }),
}));
