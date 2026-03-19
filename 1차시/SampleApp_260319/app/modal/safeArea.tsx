import { Link } from 'expo-router';
import {StyleSheet, View} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ModalForSafeArea() {
  const inset = useSafeAreaInsets();
  return (
      <ThemedView style={styles.contentContainer}>
        <View style={[styles.commonStyle, {
          height: inset.top,
          width: "100%",
          top: 0,
        }]}></View>
        <View style={[styles.commonStyle, {
          height: inset.bottom,
          width: "100%",
          bottom: 0,
        }]}></View>
        <View style={[styles.commonStyle, {
          width: inset.left,
          height: "100%",
          left: 0,
        }]}></View>
        <View style={[styles.commonStyle, {
          width: inset.right,
          height: "100%",
          left: 0,
        }]}></View>
        <View style={[styles.dataContainer, styles.dataContainerSub]}>
          <View style={styles.margin_sm}>
            <ThemedText style={styles.title}>이 기기의{'\n'}SafeArea Inset은?</ThemedText>
            <ThemedText>여기에서 <ThemedText style={styles.blueAreaText}>파란색</ThemedText>으로 표기된 영역은{'\n'}Safe Area에 의해 보호되는 영역입니다.</ThemedText>
          </View>
          <View>
            <View style={styles.flexRow}>
              <ThemedText type="subtitle">Left</ThemedText>
              <ThemedText>{inset.left} dp</ThemedText>
            </View>
            <View style={styles.flexRow}>
              <ThemedText type="subtitle">Right</ThemedText>
              <ThemedText>{inset.right} dp</ThemedText>
            </View>
            <View style={styles.flexRow}>
              <ThemedText type="subtitle">Top</ThemedText>
              <ThemedText>{inset.top} dp</ThemedText>
            </View>
            <View style={styles.flexRow}>
              <ThemedText type="subtitle">Bottom</ThemedText>
              <ThemedText>{inset.bottom} dp</ThemedText>
            </View>
          </View>
          <Link href="/" dismissTo>
            <ThemedText type="link">뒤로 돌아가기</ThemedText>
          </Link>
        </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative'
  },

  commonStyle: {
    backgroundColor: '#2563eb',
    position: 'absolute',
  },
  dataContainer: {
    marginVertical: 'auto',
    gap: 10
  },
  dataContainerSub: {
    justifyContent: 'center',
    padding: 20,
    gap: 50,
    position: 'relative'
  },
  flexRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  margin_sm: {
    gap: 10
  },
  blueAreaText: {
    color: '#2563eb',
    fontWeight: 'bold'
  }
});