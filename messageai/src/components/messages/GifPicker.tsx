// GIF Picker Component - Phase 3B.2
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GiphyFetch } from '@giphy/js-fetch-api';
import Constants from 'expo-constants';

// Get Giphy API key from environment variables
// Fallback to demo key if not set (has strict rate limits and may be banned)
const GIPHY_API_KEY = Constants.expoConfig?.extra?.giphyApiKey || 'dc6zaTOxFJmzC';
const giphyFetch = new GiphyFetch(GIPHY_API_KEY);

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string, gifId: string) => void;
}

interface GifResult {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
}

const { width } = Dimensions.get('window');
const GIF_SIZE = (width - 48) / 3; // 3 columns with padding

export default function GifPicker({ visible, onClose, onSelectGif }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      // Load trending GIFs if no search query
      loadTrendingGifs();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await giphyFetch.search(query, {
        limit: 30,
        rating: 'g', // Family-friendly content
      });

      const formattedGifs: GifResult[] = data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        previewUrl: gif.images.fixed_width_small.url,
        title: gif.title || 'GIF',
      }));

      setGifs(formattedGifs);
    } catch (err: any) {
      console.error('[GifPicker] Search error:', err);
      setError('Failed to search GIFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingGifs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await giphyFetch.trending({
        limit: 30,
        rating: 'g',
      });

      const formattedGifs: GifResult[] = data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        previewUrl: gif.images.fixed_width_small.url,
        title: gif.title || 'GIF',
      }));

      setGifs(formattedGifs);
    } catch (err: any) {
      console.error('[GifPicker] Trending error:', err);
      
      // Check if it's a BANNED error
      if (err.message?.includes('BANNED') || err.toString().includes('BANNED')) {
        setError('Giphy API key is banned or invalid.\n\nPlease get a free API key from developers.giphy.com and add it to your app.json');
      } else {
        setError('Failed to load trending GIFs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchGifs(searchQuery);
  };

  const handleSelectGif = (gif: GifResult) => {
    onSelectGif(gif.url, gif.id);
    onClose();
    // Reset state
    setSearchQuery('');
    setGifs([]);
    setError(null);
  };

  const handleModalOpen = () => {
    // Load trending GIFs when modal opens
    if (gifs.length === 0) {
      loadTrendingGifs();
    }
  };

  React.useEffect(() => {
    if (visible) {
      handleModalOpen();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose a GIF</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search GIFs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Powered by Giphy */}
        <View style={styles.giphyBadge}>
          <Text style={styles.giphyBadgeText}>Powered by GIPHY</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadTrendingGifs()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading GIFs...</Text>
          </View>
        )}

        {/* GIF Grid */}
        {!loading && !error && (
          <FlatList
            data={gifs}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gifItem}
                onPress={() => handleSelectGif(item)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.previewUrl }}
                  style={styles.gifImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🎭</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No GIFs found' : 'Search for GIFs'}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Type something and tap search'}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  giphyBadge: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  giphyBadgeText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  gridContent: {
    padding: 8,
  },
  gifItem: {
    width: GIF_SIZE,
    height: GIF_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

