import * as Sentry from '@sentry/react-native';
import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

interface State {
    hasError: boolean;
    error: Error | null;
}

interface Props {
    children: React.ReactNode;
    /** 커스텀 fallback을 주입하면 DefaultFallback 대신 렌더됩니다. */
    fallback?: React.ReactNode;
    /** 에러 발생 시 외부 핸들러 호출 */
    onError?: (error: Error, info: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };

    // 렌더 직전에 호출 — state만 업데이트, 부수 효과 금지
    static getDerivedStateFromError(error: Error): State {
        // TODO 1-1. hasError: true, error를 담은 State 객체를 반환하세요.
        return { hasError: true, error };
    }

    // 렌더 완료 후 호출 — 부수 효과(로깅, 네트워크) 허용
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] caught:', error.message);
        console.error('[ErrorBoundary] stack:', info.componentStack);
        Sentry.captureException(error, {
            extra: { componentStack: info.componentStack ?? '' },
        });
        // TODO 1-2. this.props.onError?.(error, info)를 호출하세요.
        this.props.onError?.(error, info);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // TODO 1-3. props.fallback이 있으면 fallback을, 없으면 DefaultFallback을 렌더링하세요.
            //           DefaultFallback에는 error={this.state.error} onReset={this.handleReset}을 전달합니다.
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

function DefaultFallback({
    error,
    onReset,
}: {
    error: Error | null;
    onReset: () => void;
}) {
    return (
        <View style={styles.container}>
            {/* TODO 1-4. 아래 3가지를 구현하세요.
                  - 에러 메시지 텍스트 (기술적 내용을 그대로 노출하지 말 것)
                  - "다시 시도" Pressable 버튼 (onPress: onReset)
                  - 에러 코드 텍스트 (error?.message?.slice(0, 24) ?? 'UNKNOWN')
            */}
            <Text style={styles.title}>문제가 발생했습니다</Text>
            <Text style={styles.errorCode}>
                {error?.message?.slice(0, 24) ?? 'UNKNOWN'}
            </Text>
            <Pressable style={styles.button} onPress={onReset}>
                <Text style={styles.buttonText}>다시 시도</Text>
            </Pressable>
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
    // TODO 1-4. 필요한 스타일을 추가하세요.
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    errorCode: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'monospace',
    },
    button: {
        marginTop: 16,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
