import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Pretendard } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

// TODO 3-1. fallback으로 사용할 TabFallback 컴포넌트를 직접 만들어보세요.
//           내용: "탭 화면에 문제가 발생했어요.\n앱을 재시작해 주세요."

const styles = StyleSheet.create({
    fallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    fallbackText: {
        fontSize: 15,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        // TODO 3-2. Tabs 전체를 ErrorBoundary로 감싸세요.
        //           fallback은 위에서 만든 TabFallback 컴포넌트를 사용하세요.
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name='house.fill' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name='person-circle-outline'
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
