type Level = 'info' | 'warn' | 'error';

interface LogEvent {
    level: Level;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
}

const queue: LogEvent[] = [];

export function log(
    level: Level,
    message: string,
    context?: Record<string, unknown>,
) {
    const event: LogEvent = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
        const label = `[${level.toUpperCase()}]`;
        if (level === 'error') {
            console.error(label, message, context ?? '');
        } else if (level === 'warn') {
            console.warn(label, message, context ?? '');
        } else {
            console.log(label, message, context ?? '');
        }
    }

    queue.push(event);
}

// 쌓인 로그를 꺼내고 큐를 비웁니다.
// 실무에서는 이 함수를 백그라운드 타이머로 호출해 서버로 전송합니다.
export function flushLogs(): LogEvent[] {
    return queue.splice(0, queue.length);
}
