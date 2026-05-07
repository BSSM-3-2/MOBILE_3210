import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL: string =
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    'https://bssm-api.zer0base.me';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// 모든 요청 전에 실행 — 토큰 주입
apiClient.interceptors.request.use(
    config => {
        // auth-store를 직접 import하면 순환 참조가 생기므로 동적으로 참조
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/store/auth-store');
        const token: string | null = useAuthStore.getState().accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error),
);

// Response Interceptor
// 모든 응답 후에 실행 — 401이면 토큰 갱신 후 원본 요청 재시도
let isRefreshing = false;
type QueueItem = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};
let pendingQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    pendingQueue = [];
}

apiClient.interceptors.response.use(
    response => response,
    async error => {
        const status = error.response?.status;
        const originalConfig = error.config;

        if (status === 404) {
            console.warn(
                '[API] 리소스를 찾을 수 없습니다:',
                originalConfig?.url,
            );
            return Promise.reject(error);
        }

        if (status === 401) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useAuthStore } = require('@/store/auth-store');
            const store = useAuthStore.getState();

            // 이미 갱신 중이면 완료될 때까지 대기열에 추가
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then(newToken => {
                    originalConfig.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalConfig);
                });
            }

            isRefreshing = true;

            try {
                const newToken = await store.refreshAccessToken();
                processQueue(null, newToken);
                originalConfig.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalConfig);
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.warn('[API] 토큰 갱신 실패. 로그아웃 처리');
                await store.logOut();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('[API] 서버 에러:', status, error.message);
        return Promise.reject(error);
    },
);

export default apiClient;
