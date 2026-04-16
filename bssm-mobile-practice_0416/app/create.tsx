import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPost } from '@/api/content';
import { useFeedStore } from '@/store/feed-store';
import { Pretendard, FontSizes, Spacing, FeedColors } from '@/constants/theme';

interface SelectedImage {
    uri: string;
    name: string;
    type: string;
}

// 업로드 성공 후 로컬 알림 예약
async function scheduleUploadNotification(caption: string) {

    const Notifications = await import('expo-notifications');
        console.log('[LocalPush] 예약 시도 시작');

    // TODO 실습 6-1
    // getPermissionsAsync로 알림 권한을 확인하고 미허용이면 return 하세요
    const { status } = await Notifications.getPermissionsAsync();
        console.log('[LocalPush] 권한 상태:', status);
        if (status !== 'granted') {
            console.log('[LocalPush] 권한 미허용으로 예약 중단');
            return;
        }

    // TODO 실습 8
    // heads-up 동작 비교용: importance를 바꿀 때 channelId도 함께 바꿔 테스트하세요.
    // 예) HIGH -> DEFAULT로 바꾸면 channelId도 ...-high-v2 -> ...-default-v3 처럼 변경
    const channelImportance = Notifications.AndroidImportance.HIGH;
    const channelId = 'upload-local-high-v2';

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(channelId, {
            name: '업로드 알림',
            importance: channelImportance,
            vibrationPattern: [0, 250, 150, 250],
            lightColor: '#0095F6',
        });
            console.log('[LocalPush] Android 채널 생성/확인:', channelId);
    }

    // scheduleNotificationAsync로 로컬 알림을 발송하세요
    // content에 title, body를 구성하고
        const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: '업로드 완료',
            body: caption
                ? `게시물이 업로드됐어요: ${caption}`
                : '새 게시물이 업로드됐어요.',
            data: {
                screen: 'feed',
                type: 'upload-complete',
            },
            ...(Platform.OS === 'android' ? { channelId } : {}),
        },
        // TODO 실습 6-2
        // trigger: { seconds: N }으로 N초 딜레이 발송을 테스트해보세요
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 3,
        },
    });
        console.log('[LocalPush] 3초 예약 완료. id:', notificationId);

    // 채널 테스트 메모
    // 1) importance를 바꿔도 기존 채널엔 즉시 반영되지 않습니다.
    // 2) 앱 재설치 또는 channelId 변경 후 다시 비교하세요.
}

export default function CreateScreen() {
    const insets = useSafeAreaInsets();
    const { prependPost } = useFeedStore();
    const router = useRouter();

    const [images, setImages] = useState<SelectedImage[]>([]);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    const canSubmit =
        (images.length > 0 || caption.trim().length > 0) && !loading;

    // ── 이미지 선택 ──────────────────────────────────────────────
    const handlePickImage = async () => {
        // TODO 실습 1-1
        // getMediaLibraryPermissionsAsync로 현재 권한 상태(status, canAskAgain)를 확인하세요
        const currentPermission =
            await ImagePicker.getMediaLibraryPermissionsAsync();

        let status = currentPermission.status;

        // TODO 실습 2-1
        // canAskAgain이 false면 Linking.openSettings()로 설정 앱을 유도하고 return 하세요
        // TODO 실습 3-1 (iOS)
        // Platform.OS === 'ios'이고 아직 미결정 상태라면
        // 커스텀 Alert로 사용 목적을 먼저 안내한 뒤 시스템 팝업을 띄우세요
        if (status !== 'granted' && !currentPermission.canAskAgain) {
            Linking.openSettings();
            return;
        }

        if (Platform.OS === 'ios' && status === 'undetermined') {
            const proceed = await new Promise<boolean>(resolve => {
                Alert.alert(
                    '사진 접근 권한 안내',
                    '게시물에 사진을 첨부하려면 갤러리 접근 권한이 필요해요.',
                    [
                        {
                            text: '괜찮아요',
                            style: 'cancel',
                            onPress: () => resolve(false),
                        },
                        {
                            text: '확인',
                            onPress: () => resolve(true),
                        },
                    ],
                    { cancelable: false },
                );
            });

            if (!proceed) {
                return;
            }
        }

        // TODO 실습 1-2
        // 미허용 상태라면 requestMediaLibraryPermissionsAsync로 권한을 요청하세요
        // 거부 시 Alert 안내 후 return 하세요
        if (status !== 'granted') {
            const requestedPermission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            status = requestedPermission.status;
        }

        if (status !== 'granted') {
            Alert.alert(
                '권한 필요',
                '사진을 선택하려면 갤러리 접근 권한을 허용해 주세요.',
            );
            return;
        }

        // TODO 실습 1-3
        // launchImageLibraryAsync로 이미지 피커를 실행하고
        // 선택된 asset에서 uri, fileName, mimeType을 추출해 setImages에 저장하세요
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 10 - images.length,
            quality: 0.9,
        });

        if (result.canceled) return;

        const pickedImages: SelectedImage[] = result.assets.map((asset, idx) => ({
            uri: asset.uri,
            name: asset.fileName ?? `image-${Date.now()}-${idx}.jpg`,
            type: asset.mimeType ?? 'image/jpeg',
        }));

        setImages(prev => [...prev, ...pickedImages].slice(0, 10));
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ── 업로드 ────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        try {
            const post = await createPost({
                caption: caption.trim() || undefined,
                images: images.length > 0 ? images : undefined,
            });

            // 피드 맨 앞에 낙관적으로 추가
            prependPost(post);

            // 로컬 알림 예약
            await scheduleUploadNotification(caption.trim());

            // 초기화
            setImages([]);
            setCaption('');
        } catch {
            Alert.alert(
                '업로드 실패',
                '게시물을 올리는 데 실패했습니다. 다시 시도해 주세요.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                    <Ionicons name='chevron-back' size={26} color='#262626' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>새 게시물</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    hitSlop={8}
                >
                    {loading ? (
                        <ActivityIndicator size='small' color='#0095F6' />
                    ) : (
                        <Text
                            style={[
                                styles.shareButton,
                                !canSubmit && styles.shareButtonDisabled,
                            ]}
                        >
                            공유
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                {/* 이미지 선택 영역 */}
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageRow}
                    >
                        {/* 추가 버튼 */}
                        {images.length < 10 && (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={handlePickImage}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name='image-outline'
                                    size={32}
                                    color='#8e8e8e'
                                />
                                <Text style={styles.addImageLabel}>
                                    {images.length === 0
                                        ? '사진 선택'
                                        : `+추가 (${images.length}/10)`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* 선택된 이미지 썸네일 */}
                        {images.map((img, index) => (
                            <View key={img.uri} style={styles.thumbWrapper}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.thumb}
                                />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveImage(index)}
                                    hitSlop={4}
                                >
                                    <Ionicons
                                        name='close-circle'
                                        size={20}
                                        color='#fff'
                                    />
                                </TouchableOpacity>
                                {index === 0 && (
                                    <View style={styles.coverBadge}>
                                        <Text style={styles.coverBadgeText}>
                                            대표
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 캡션 입력 */}
                <View style={styles.captionSection}>
                    <TextInput
                        style={styles.captionInput}
                        placeholder='문구를 입력하세요...'
                        placeholderTextColor='#999'
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        maxLength={2200}
                        textAlignVertical='top'
                    />
                    <Text style={styles.captionCount}>
                        {caption.length} / 2200
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const THUMB_SIZE = 100;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
    },
    headerTitle: {
        fontFamily: Pretendard.semiBold,
        fontSize: FontSizes.md,
        color: FeedColors.primaryText,
    },
    shareButton: {
        fontFamily: Pretendard.semiBold,
        fontSize: FontSizes.sm,
        color: '#0095F6',
    },
    shareButtonDisabled: {
        color: '#B2DFFC',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageSection: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
        paddingVertical: Spacing.xl,
    },
    imageRow: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        alignItems: 'flex-start',
    },
    addImageButton: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DBDBDB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#FAFAFA',
    },
    addImageLabel: {
        fontFamily: Pretendard.medium,
        fontSize: 11,
        color: '#8e8e8e',
        textAlign: 'center',
    },
    thumbWrapper: {
        position: 'relative',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    coverBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    coverBadgeText: {
        fontFamily: Pretendard.semiBold,
        fontSize: 10,
        color: '#fff',
    },
    captionSection: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#DBDBDB',
    },
    captionInput: {
        fontFamily: Pretendard.regular,
        fontSize: FontSizes.sm,
        color: FeedColors.primaryText,
        minHeight: 100,
        lineHeight: 22,
        ...Platform.select({ android: { paddingTop: 0 } }),
    },
    captionCount: {
        fontFamily: Pretendard.regular,
        fontSize: 12,
        color: '#c7c7c7',
        textAlign: 'right',
        marginTop: 4,
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    hintText: {
        fontFamily: Pretendard.regular,
        fontSize: FontSizes.xs,
        color: '#8e8e8e',
    },
});
