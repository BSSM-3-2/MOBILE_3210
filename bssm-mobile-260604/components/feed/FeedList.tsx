import { useCallback } from 'react';
import { FlatList, RefreshControl, View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { SwipeableFeedPost } from './post/SwipeableFeedPost';
import { useFeedStore } from '@/store/feed-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Animated.FlatList: Reanimated의 네이티브 이벤트 시스템과 연결된 FlatList
// — onScroll 핸들러가 JS 브리지 없이 UI 스레드에서 직접 실행됨
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

const ITEM_HEIGHT = 420;

function FeedList({
    posts,
    onEndReached,
    scrollY,
}: {
    posts: Post[];
    onEndReached?: () => void;
    scrollY?: SharedValue<number>;
}) {
    // TODO 1: useFeedStore() 전체 구독을 selector로 교체하세요
    //         const removePost = useFeedStore(s => s.removePost);
    //         const fetchFeed  = useFeedStore(s => s.fetchFeed);
    //         const loading    = useFeedStore(s => s.loading);
    const { removePost, fetchFeed, loading } = useFeedStore();

    // useAnimatedScrollHandler: 스크롤 이벤트를 UI 스레드 worklet으로 처리
    // 일반 onScroll 대비 이점: JS 스레드 부하 없이 매 프레임 정확한 위치 추적
    const scrollHandler = useAnimatedScrollHandler(event => {
        if (scrollY) scrollY.value = event.contentOffset.y;
    });

    // TODO 2: renderItem을 useCallback으로 안정화하세요
    //         dependency 배열: [removePost]
    //         SwipeableFeedPost에 React.memo가 있어야 효과가 납니다

    // TODO 3 (선택): 카드 높이가 고정이라면 getItemLayout을 추가하세요
    //         const ITEM_HEIGHT = 420; // 실제 높이로 조정
    //         getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}

    const renderItem = useCallback(
        ({ item }: { item: Post }) => (
            /* 포스트별 부분 Boundary — 한 포스트 에러가 전체 피드를 죽이지 않도록 격리 */
            <ErrorBoundary
                key={item.id}
                fallback={
                    <View style={postStyles.error}>
                        <Text style={postStyles.errorText}>
                            이 게시물을 표시할 수 없어요.
                        </Text>
                    </View>
                }
            >
                <SwipeableFeedPost post={item} onDelete={removePost} />
            </ErrorBoundary>
        ),
        [removePost],
    );

    return (
        <AnimatedFlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
            })}
            initialNumToRender={5}
            windowSize={5}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={fetchFeed}
                    tintColor='#8e8e8e'
                />
            }
        />
    );
}

const postStyles = StyleSheet.create({
    error: {
        paddingVertical: 24,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#efefef',
    },
    errorText: {
        fontSize: 13,
        color: '#c7c7c7',
    },
});

export { FeedList };
