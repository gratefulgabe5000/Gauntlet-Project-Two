import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SearchResult } from '../../services/firebase/functions';
import { useRouter } from 'expo-router';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  expandedQuery?: string;
  totalFound: number;
}

const SearchResultCard: React.FC<{ result: SearchResult; onPress: () => void }> = ({ result, onPress }) => {
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Truncate long content
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.conversationName}>{result.conversationName}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(result.timestamp)}</Text>
      </View>
      
      <Text style={styles.senderName}>{result.senderName}</Text>
      
      <Text style={styles.messageContent}>{truncateContent(result.content)}</Text>
      
      {result.relevanceScore && result.relevanceScore > 0 && (
        <View style={styles.relevanceBadge}>
          <Text style={styles.relevanceText}>
            {Math.round(result.relevanceScore * 100)}% match
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SearchResults({ results, query, expandedQuery, totalFound }: SearchResultsProps) {
  const router = useRouter();

  const handleResultPress = (result: SearchResult) => {
    // Navigate to the conversation containing the message
    router.push(`/conversation/${result.conversationId}`);
  };

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyText}>No messages found</Text>
        <Text style={styles.emptySubtitle}>
          Try searching for different keywords or check your spelling
        </Text>
        {expandedQuery && (
          <View style={styles.expandedQueryContainer}>
            <Text style={styles.expandedQueryLabel}>Searched for:</Text>
            <Text style={styles.expandedQueryText}>{expandedQuery}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Search Results</Text>
        <Text style={styles.subtitle}>
          Found {totalFound} {totalFound === 1 ? 'message' : 'messages'} for "{query}"
        </Text>
        {expandedQuery && expandedQuery !== query && (
          <View style={styles.expandedQueryContainer}>
            <Text style={styles.expandedQueryLabel}>Also searched:</Text>
            <Text style={styles.expandedQueryText}>{expandedQuery}</Text>
          </View>
        )}
      </View>

      <View style={styles.resultsSection}>
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.messageId}-${index}`}
            result={result}
            onPress={() => handleResultPress(result)}
          />
        ))}
      </View>

      {totalFound > results.length && (
        <View style={styles.moreResults}>
          <Text style={styles.moreResultsText}>
            Showing {results.length} of {totalFound} results
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  expandedQueryContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    width: '100%',
  },
  expandedQueryLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  expandedQueryText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  resultsSection: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  senderName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  relevanceBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  relevanceText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  moreResults: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  moreResultsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

