// Voice Message Component - Phase 1B
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { playAudio, formatDuration } from '../../services/audio.service';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  isSender: boolean;
}

export default function VoiceMessage({ audioUrl, duration = 0, isSender }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlay = async () => {
    try {
      if (isPlaying && sound) {
        // Pause
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        // Resume
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        // Start new playback
        const newSound = await playAudio(audioUrl);
        if (newSound) {
          setSound(newSound);
          setIsPlaying(true);

          // Listen for playback status
          newSound.setOnPlaybackStatusUpdate((status) => {
            if ('isLoaded' in status && status.isLoaded) {
              if (status.didJustFinish) {
                setIsPlaying(false);
                setCurrentPosition(0);
              } else {
                const pos = status.positionMillis ? Math.floor(status.positionMillis / 1000) : 0;
                setCurrentPosition(pos);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const displayDuration = isPlaying ? currentPosition : duration;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.receiverContainer,
      ]}
      onPress={handlePlay}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        <View style={styles.waveform}>
          {/* Simple waveform representation */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: Math.random() * 20 + 10 },
                isSender ? styles.senderBar : styles.receiverBar,
              ]}
            />
          ))}
        </View>
        <Text style={[styles.duration, isSender ? styles.senderText : styles.receiverText]}>
          {formatDuration(displayDuration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    marginVertical: 4,
  },
  senderContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 30,
    marginRight: 8,
  },
  bar: {
    width: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  senderBar: {
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  receiverBar: {
    backgroundColor: '#007AFF',
    opacity: 0.6,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
  },
  senderText: {
    color: '#FFFFFF',
  },
  receiverText: {
    color: '#000000',
  },
});


