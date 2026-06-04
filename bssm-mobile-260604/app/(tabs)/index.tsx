import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    TouchableOpacity,
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
} from 'react-native';
import NavigationTop from '@components/navigation/NavigationTop';
import ContentContainer from '@components/container';
import { FeedList } from '@components/feed/FeedList';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@components/themed-view';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { useRouter } from 'expo-router';
import { Pretendard } from '@/constants/theme';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

// 피드 로드 실패 시 표시되는 에러 UI
// Error Boundary는 async 에러를 잡지 못하므로 store error 상태를 직접 읽어 처리
function FeedError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <View style={feedErrorStyles.container}>
            <Text style={feedErrorStyles.emoji}>📡</Text>
            <Text style={feedErrorStyles.title}>피드를 불러올 수 없어요</Text>
            <Text style={feedErrorStyles.message}>{message}</Text>
            <Pressable
                style={({ pressed }) => [
                    feedErrorStyles.button,
                    pressed && feedErrorStyles.buttonPressed,
                ]}
                onPress={onRetry}
            >
                <Text style={feedErrorStyles.buttonText}>다시 시도</Text>
            </Pressable>
        </View>
    );
}

const searchStyles = StyleSheet.create({
    input: {
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#efefef',
        fontSize: 14,
        fontFamily: Pretendard.regular,
    },
});

const feedErrorStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 10,
    },
    emoji: { fontSize: 40, marginBottom: 4 },
    title: {
        fontSize: 17,
        fontFamily: Pretendard.bold,
        color: '#262626',
    },
    message: {
        fontSize: 13,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
        textAlign: 'center',
    },
    button: {
        marginTop: 8,
        backgroundColor: '#0095F6',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonPressed: { opacity: 0.7 },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: Pretendard.semiBold,
    },
});

export default function HomeScreen() {
    // TODO: useFeedStore()를 useFeedPosts() Hook으로 교체하세요 (실습 5)
    //       import { useFeedPosts } from '@/hooks/useFeedPosts';
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const { filteredPosts, loading, error, fetchFeed, loadMore } = useFeedPosts(keyword);

    // scrollY: 스크롤 위치를 UI 스레드에서 직접 추적하는 SharedValue
    const scrollY = useSharedValue(0);

    // useAnimatedStyle: scrollY 변화에 따라 헤더를 UI 스레드에서 직접 변환
    // interpolate: 입력 범위 [0, 80] → 출력 범위 매핑 (Extrapolation.CLAMP: 범위 초과 시 고정)
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    scrollY.value,
                    [0, 80],
                    [0, -80],
                    Extrapolation.CLAMP,
                ),
            },
        ],
        opacity: interpolate(
            scrollY.value,
            [0, 60],
            [1, 0],
            Extrapolation.CLAMP,
        ),
    }));

    useEffect(() => {
        fetchFeed();
    }, []);

    return (
        <ThemedView style={{ flex: 1, overflow: 'hidden' }}>
            {/* Animated.View: headerAnimatedStyle 적용 — 스크롤에 따라 헤더 숨김 */}
            <Animated.View style={headerAnimatedStyle}>
                <ContentContainer isTopElement={true}>
                    <NavigationTop
                        title='MyFeed'
                        icon={'layers'}
                        rightButtons={
                            <TouchableOpacity
                                onPress={() => router.push('/create' as never)}
                                hitSlop={8}
                            >
                                <Ionicons
                                    name='add-outline'
                                    size={28}
                                    color='#262626'
                                />
                            </TouchableOpacity>
                        }
                    />
                </ContentContainer>
            </Animated.View>

            <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder='게시물 검색'
                style={searchStyles.input}
            />

            {/* API 에러 — 피드 목록이 비어있을 때만 전체 에러 화면 표시 */}
            {error && filteredPosts.length === 0 ? (
                <FeedError message={error} onRetry={fetchFeed} />
            ) : loading && filteredPosts.length === 0 ? (
                <ActivityIndicator style={{ flex: 1 }} />
            ) : (
                // scrollY를 FeedList에 전달 → useAnimatedScrollHandler가 내부에서 처리
                <FeedList
                    posts={filteredPosts}
                    onEndReached={loadMore}
                    scrollY={scrollY}
                />
            )}
        </ThemedView>
    );
}
