import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Pretendard } from '@/constants/theme';
import { log } from '@/utils/logger';
import * as Sentry from '@sentry/react-native';

interface State {
    hasError: boolean;
    error: Error | null;
}

interface Props {
    children: React.ReactNode;
    /** 커스텀 fallback을 주입하면 DefaultFallback 대신 렌더됩니다. */
    fallback?: React.ReactNode;
    /** 에러 발생 시 외부 핸들러 호출 (예: Sentry.captureException) */
    onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };

    // 렌더 직전에 호출 — state만 업데이트, 부수 효과 금지
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    // 렌더 완료 후 호출 — 부수 효과(로깅, 네트워크) 허용
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        log('error', error.message, {
            componentStack: info.componentStack ?? '',
        });
        Sentry.captureException(error, {
            extra: { componentStack: info.componentStack ?? '' },
        });
        this.props.onError?.(error, info);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <DefaultFallback
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }
        return this.props.children;
    }
}

// ──────────────────────────────────────────────────────────────────────────
// Fallback UI: 명확한 메시지 + 복구 액션 + 작은 에러 코드 (슬라이드 32번 기준)
// ──────────────────────────────────────────────────────────────────────────
function DefaultFallback({
    error,
    onReset,
}: {
    error: Error | null;
    onReset: () => void;
}) {
    // 기술적 내용을 그대로 노출하지 않고 앞 24자만 코드로 표시
    const errorCode = error?.message?.slice(0, 24) ?? 'UNKNOWN';

    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>문제가 발생했어요</Text>
            <Text style={styles.subtitle}>
                잠시 후 다시 시도해 주세요.{'\n'}
                같은 문제가 반복된다면 고객센터에 문의해 주세요.
            </Text>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onReset}
            >
                <Text style={styles.buttonText}>다시 시도</Text>
            </Pressable>
            <Text style={styles.errorCode}>오류 코드: {errorCode}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 12,
        backgroundColor: '#fff',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontFamily: Pretendard.bold,
        color: '#262626',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        marginTop: 8,
        backgroundColor: '#0095F6',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: Pretendard.semiBold,
    },
    errorCode: {
        marginTop: 4,
        fontSize: 11,
        color: '#c7c7c7',
        fontFamily: Pretendard.regular,
    },
});
