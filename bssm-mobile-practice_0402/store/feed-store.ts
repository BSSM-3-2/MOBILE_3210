import { create } from 'zustand';
import { Post } from '@type/Post';
import { getFeed, likePost, unlikePost } from '@/api/content';

interface FeedState {
    posts: Post[];
    page: number;
    hasNext: boolean;
    loading: boolean;
    error: string | null;

    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    page: 1,
    hasNext: false,
    loading: false,
    error: null,

    fetchFeed: async () => {
        // TODO: (4차) set()으로 loading을 켜고, getFeed(1)를 호출해 posts/pagination을 저장한다
        // 힌트: try/catch로 감싸고 실패 시 error 메시지도 저장한다
        set({ loading: true });
        console.log('피드 불러오기 시작');
        try {
            const { data, pagination } = await getFeed(1);
            set({
                posts: data,
                page: 1,
                hasNext: pagination.hasNext,
                loading: false,
            });
            console.log('피드 불러오기 성공:', data);
        } catch {
            set({ loading: false, error: 'Failed to fetch feed' });
        }
    },

    loadMore: async () => {
        const { loading, hasNext, page, posts } = get();
        if (loading || !hasNext) return;

        set({ loading: true });
        try {
            const nextPage = page + 1;
            const { data, pagination } = await getFeed(nextPage);
            set({
                posts: [...posts, ...data],
                page: nextPage,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    // 낙관적 업데이트: UI를 먼저 바꾸고 API 호출 → 실패 시 원상복구
    toggleLike: async (postId: string) => {
        const posts = get().posts;
        const target = posts.find(p => p.id === postId);
        if (!target) return;

        // ① UI 즉시 반영 — 서버 응답을 기다리지 않고 지금 바꿈
        const originalLiked = target.liked ?? false;
        const originalLikes = target.likes ?? 0;

        set({
            posts: posts.map(p =>
                p.id === postId
                    ? {
                          ...p,
                          liked: !originalLiked,
                          likes: originalLiked
                              ? originalLikes - 1
                              : originalLikes + 1,
                      }
                    : p,
            ),
        });

        try {
            // ② API 호출 — 실제 서버에 요청
            const result = originalLiked
                ? await unlikePost(postId)
                : await likePost(postId);

            // ③ 서버 응답으로 동기화 — 서버에서 받은 데이터로 업데이트
            set({
                posts: get().posts.map(p =>
                    p.id === postId
                        ? {
                              ...p,
                              liked: result.liked,
                              likes: result.likes,
                          }
                        : p,
                ),
            });
        } catch {
            // ④ 실패 시 롤백 — 원래 상태로 돌리기
            set({
                posts: get().posts.map(p =>
                    p.id === postId
                        ? {
                              ...p,
                              liked: originalLiked,
                              likes: originalLikes,
                          }
                        : p,
                ),
            });
        }
    },
}));
