import { useFeedStore } from '@/store/feed-store';

// TODO: 아래 Hook을 완성하세요
//
// 목표: HomeScreen에서 useFeedStore()를 직접 쓰던 로직을 이 Hook으로 분리합니다
//       화면 컴포넌트는 배치만 담당하고, 데이터 처리는 Hook이 담당합니다
//
// 반환해야 하는 값: posts, loading, error, fetchFeed, loadMore
// 각 값을 selector로 구독하세요 (예: useFeedStore(s => s.posts))

export function useFeedPosts() {
    const posts = useFeedStore(s => s.posts);

    // TODO: loading, error, fetchFeed, loadMore도 추가하세요

    return { posts };
}
