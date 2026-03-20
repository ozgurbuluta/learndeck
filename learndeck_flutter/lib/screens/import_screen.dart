import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:convert';
import '../services/ai_service.dart';
import '../services/firebase_service.dart';
import '../providers/words_provider.dart';

class ImportScreen extends ConsumerStatefulWidget {
  const ImportScreen({super.key});

  @override
  ConsumerState<ImportScreen> createState() => _ImportScreenState();
}

class _ImportScreenState extends ConsumerState<ImportScreen> {
  bool _isLoading = false;
  String? _statusMessage;
  List<ExtractedWord> _extractedWords = [];
  bool _showPreview = false;

  Future<void> _pickAndProcessFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'txt', 'csv'],
        withData: true,
      );

      if (result == null || result.files.isEmpty) return;

      final file = result.files.first;
      if (file.bytes == null) {
        setState(() => _statusMessage = 'Could not read file');
        return;
      }

      setState(() {
        _isLoading = true;
        _statusMessage = 'Processing ${file.name}...';
        _extractedWords = [];
        _showPreview = false;
      });

      // Convert bytes to text
      String content;
      if (file.extension == 'pdf') {
        // For PDF, we send the text extracted client-side
        // In a real app, you'd use a PDF parsing library
        content = utf8.decode(file.bytes!, allowMalformed: true);
      } else {
        content = utf8.decode(file.bytes!);
      }

      final response = await AIService.processDocument(
        content: content,
        fileType: file.extension ?? 'txt',
      );

      setState(() {
        _isLoading = false;
        if (response.success && response.words.isNotEmpty) {
          _extractedWords = response.words;
          _showPreview = true;
          _statusMessage = 'Found ${response.words.length} words';
        } else {
          _statusMessage = response.error ?? 'No words found in document';
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = 'Error: $e';
      });
    }
  }

  Future<void> _saveAllWords() async {
    if (_extractedWords.isEmpty) return;

    setState(() {
      _isLoading = true;
      _statusMessage = 'Saving words...';
    });

    try {
      int savedCount = 0;
      for (final word in _extractedWords) {
        await FirebaseService.createWord(
          word: word.word,
          definition: word.definition,
          article: word.article,
        );
        savedCount++;
      }

      // Refresh words list
      ref.read(wordsProvider.notifier).loadWords();

      setState(() {
        _isLoading = false;
        _statusMessage = '✅ Saved $savedCount words!';
        _extractedWords = [];
        _showPreview = false;
      });

      // Go back after short delay
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) Navigator.pop(context);
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = 'Error saving: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Import Words', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Import button
            Container(
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                color: const Color(0xFF252542),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFF6366f1).withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.upload_file,
                    size: 60,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Import from File',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Supports PDF, TXT, CSV files',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _pickAndProcessFile,
                    icon: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.folder_open),
                    label: Text(_isLoading ? 'Processing...' : 'Choose File'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366f1),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Status message
            if (_statusMessage != null) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _statusMessage!.startsWith('✅')
                      ? Colors.green.withValues(alpha: 0.2)
                      : _statusMessage!.startsWith('Error')
                          ? Colors.red.withValues(alpha: 0.2)
                          : const Color(0xFF252542),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _statusMessage!,
                  style: TextStyle(
                    color: _statusMessage!.startsWith('✅')
                        ? Colors.green
                        : _statusMessage!.startsWith('Error')
                            ? Colors.red
                            : Colors.white70,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],

            // Preview extracted words
            if (_showPreview && _extractedWords.isNotEmpty) ...[
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Preview',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _saveAllWords,
                    icon: const Icon(Icons.save, size: 18),
                    label: const Text('Save All'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...(_extractedWords.map((word) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF252542),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                word.word,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                word.definition,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.6),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.close,
                            color: Colors.white.withValues(alpha: 0.5),
                            size: 20,
                          ),
                          onPressed: () {
                            setState(() {
                              _extractedWords.remove(word);
                              if (_extractedWords.isEmpty) {
                                _showPreview = false;
                              }
                            });
                          },
                        ),
                      ],
                    ),
                  ))),
            ],
          ],
        ),
      ),
    );
  }
}
