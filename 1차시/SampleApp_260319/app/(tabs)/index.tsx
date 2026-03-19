import { Image } from 'expo-image';
import {Platform, StyleSheet, View} from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function HomeScreen() {
  const inset = useSafeAreaInsets();
  const style = StyleSheet.create({
    container: {
      paddingTop: inset.top + 50,
      paddingHorizontal: 16,
    },
    alignTextCenter: {
      alignSelf: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    paragraph: {
      fontSize: 16,
    }
  })
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={style.container}>
          <ThemedText style={[style.title, style.alignTextCenter]}>SampleApp</ThemedText>
          <ThemedText style={[style.paragraph, style.alignTextCenter]}>2026. 03. 19</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">안녕하세요! <HelloWave /></ThemedText>
        <ThemedText>이번 시간에 배울 내용들을 담았습니다.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal/button">
          <Link.Trigger>
            <ThemedText type="subtitle">1. Button과 TouchOpacity</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          Button과 TouchOpacity가 어떻게 표시되는지 확인합니다.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal/safeArea">
          <Link.Trigger>
            <ThemedText type="subtitle">2. Safe Area Inset</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          내 스마트폰에서 Safe Area 영역을 확인합니다.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    gap: 2,
    paddingBottom: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
