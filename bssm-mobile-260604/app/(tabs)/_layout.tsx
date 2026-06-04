import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Pretendard } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function TabFallback() {
    return (
        <View style={styles.fallback}>
            <Text style={styles.fallbackText}>
                탭 화면에 문제가 발생했어요.{'\n'}앱을 재시작해 주세요.
            </Text>
        </View>
    );
}

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
        /* 탭 Boundary — 탭 전체에서 에러 발생 시 앱 전체가 죽지 않도록 격리 */
        <ErrorBoundary fallback={<TabFallback />}>
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
                            <IconSymbol
                                size={28}
                                name='house.fill'
                                color={color}
                            />
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
        </ErrorBoundary>
    );
}
