import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../models/word.dart';
import '../providers/words_provider.dart';

class WordListScreen extends ConsumerStatefulWidget {
  const WordListScreen({super.key});

  @override
  ConsumerState<WordListScreen> createState() => _WordListScreenState();
}

class _WordListScreenState extends ConsumerState<WordListScreen> {
  final _searchController = TextEditingController();
  final FlutterTts _tts = FlutterTts();
  String _searchQuery = '';
  String _filterDifficulty = 'all';

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.setLanguage('de-DE');
    await _tts.setSpeechRate(0.5);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tts.stop();
    super.dispose();
  }

  Future<void> _speak(String text) async {
    await _tts.speak(text);
  }

  List<Word> _filterWords(List<Word> words) {
    return words.where((word) {
      final matchesSearch = _searchQuery.isEmpty ||
          word.word.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          word.definition.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesFilter = _filterDifficulty == 'all' ||
          word.difficulty.toString().split('.').last == _filterDifficulty;

      return matchesSearch && matchesFilter;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final wordsAsync = ref.watch(wordsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('My Words', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search words...',
                hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                prefixIcon: Icon(Icons.search, color: Colors.white.withValues(alpha: 0.5)),
                filled: true,
                fillColor: const Color(0xFF252542),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),

          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildFilterChip('all', 'All'),
                _buildFilterChip('newWord', 'New'),
                _buildFilterChip('learning', 'Learning'),
                _buildFilterChip('review', 'Review'),
                _buildFilterChip('mastered', 'Mastered'),
                _buildFilterChip('failed', 'Failed'),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Word list
          Expanded(
            child: wordsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: Color(0xFF6366f1)),
              ),
              error: (e, _) => Center(
                child: Text('Error: $e', style: const TextStyle(color: Colors.red)),
              ),
              data: (words) {
                final filtered = _filterWords(words);
                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search_off, size: 60, color: Colors.white.withValues(alpha: 0.3)),
                        const SizedBox(height: 16),
                        Text(
                          _searchQuery.isNotEmpty ? 'No matching words' : 'No words yet',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) => _buildWordTile(filtered[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _filterDifficulty == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => setState(() => _filterDifficulty = value),
        backgroundColor: const Color(0xFF252542),
        selectedColor: const Color(0xFF6366f1),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : Colors.white70,
          fontSize: 13,
        ),
        checkmarkColor: Colors.white,
      ),
    );
  }

  Widget _buildWordTile(Word word) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF252542),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          word.displayWord,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              word.definition,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                _buildDifficultyBadge(word.difficulty),
                const SizedBox(width: 8),
                Text(
                  '${(word.accuracy * 100).toInt()}% accuracy',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                ),
              ],
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.volume_up, color: Color(0xFF6366f1)),
              onPressed: () => _speak(word.word),
            ),
            IconButton(
              icon: Icon(Icons.delete_outline, color: Colors.red.withValues(alpha: 0.7)),
              onPressed: () => _confirmDelete(word),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDifficultyBadge(Difficulty difficulty) {
    Color color;
    String label;

    switch (difficulty) {
      case Difficulty.newWord:
        color = Colors.blue;
        label = 'New';
        break;
      case Difficulty.learning:
        color = Colors.orange;
        label = 'Learning';
        break;
      case Difficulty.review:
        color = Colors.purple;
        label = 'Review';
        break;
      case Difficulty.mastered:
        color = Colors.green;
        label = 'Mastered';
        break;
      case Difficulty.failed:
        color = Colors.red;
        label = 'Failed';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500),
      ),
    );
  }

  void _confirmDelete(Word word) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF252542),
        title: const Text('Delete Word', style: TextStyle(color: Colors.white)),
        content: Text(
          'Delete "${word.word}"?',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(wordsProvider.notifier).deleteWord(word.id);
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
