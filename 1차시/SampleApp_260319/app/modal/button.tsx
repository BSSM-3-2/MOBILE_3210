import { Link } from 'expo-router';
import {Button, StyleSheet, TouchableOpacity, View} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModelForButton() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>두 종류의 버튼을{'\n'}한번 확인해보세요.</ThemedText>
      <ThemedView style={styles.maxWidth}>
        <View style={styles.flexRow}>
          <ThemedText type="subtitle">Button</ThemedText>
          <Button title={"Button"} onPress={() => alert('Button pressed')}/>
        </View>
        <View style={styles.flexRow}>
          <ThemedText type="subtitle">TouchableOpacity</ThemedText>
          <TouchableOpacity onPress={() => alert('TouchableOpacity pressed')}>
            <ThemedText type="link" style={[styles.buttonDesign]}>Button</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">홈으로 돌아가기</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 50
  },
  link: {
    paddingVertical: 15,
    textAlign: 'center',
  },
  buttonDesign: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    color: 'white',
    width: 'auto'
  },
  flexRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  maxWidth: {
    width: '100%',
  }
});
