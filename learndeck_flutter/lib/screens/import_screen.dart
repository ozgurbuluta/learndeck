import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:convert';
import '../services/ai_service.dart';
import '../services/firebase_service.dart';
import '../providers/words_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/widgets.dart';

class ImportScreen extends ConsumerStatefulWidget {
  const ImportScreen({super.key});

  @override
  ConsumerState<ImportScreen> createState() => _ImportScreenState();
}

class _ImportScreenState extends ConsumerState<ImportScreen> {
  bool _isLoading = false;
  String? _statusMessage;
  bool _isSuccess = false;
  bool _isError = false;
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
        setState(() {
          _statusMessage = 'Could not read file';
          _isError = true;
          _isSuccess = false;
        });
        return;
      }

      setState(() {
        _isLoading = true;
        _statusMessage = 'Processing ${file.name}...';
        _isError = false;
        _isSuccess = false;
        _extractedWords = [];
        _showPreview = false;
      });

      String content;
      if (file.extension == 'pdf') {
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
          _isSuccess = true;
          _isError = false;
        } else {
          _statusMessage = response.error ?? 'No words found in document';
          _isError = true;
          _isSuccess = false;
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = 'Error: $e';
        _isError = true;
        _isSuccess = false;
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

      ref.read(wordsProvider.notifier).loadWords();

      setState(() {
        _isLoading = false;
        _statusMessage = 'Saved $savedCount words!';
        _isSuccess = true;
        _isError = false;
        _extractedWords = [];
        _showPreview = false;
      });

      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) Navigator.pop(context);
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = 'Error saving: $e';
        _isError = true;
        _isSuccess = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text('Import Words'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Import button
            Container(
              padding: const EdgeInsets.all(AppSpacing.xxxl),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.upload_file_rounded,
                      size: 48,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  Text(
                    'Import from File',
                    style: AppTextStyles.h3,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Supports PDF, TXT, CSV files',
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  PrimaryButton(
                    label: _isLoading ? 'Processing...' : 'Choose File',
                    icon: _isLoading ? null : Icons.folder_open_rounded,
                    isLoading: _isLoading,
                    fullWidth: false,
                    onPressed: _isLoading ? null : _pickAndProcessFile,
                  ),
                ],
              ),
            ),

            // Status message
            if (_statusMessage != null) ...[
              const SizedBox(height: AppSpacing.xl),
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: _isSuccess
                      ? AppColors.success.withValues(alpha: 0.1)
                      : _isError
                          ? AppColors.error.withValues(alpha: 0.1)
                          : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(
                    color: _isSuccess
                        ? AppColors.success.withValues(alpha: 0.3)
                        : _isError
                            ? AppColors.error.withValues(alpha: 0.3)
                            : AppColors.border,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isSuccess
                          ? Icons.check_circle_rounded
                          : _isError
                              ? Icons.error_outline_rounded
                              : Icons.info_outline_rounded,
                      color: _isSuccess
                          ? AppColors.success
                          : _isError
                              ? AppColors.error
                              : AppColors.textSecondary,
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Text(
                        _statusMessage!,
                        style: AppTextStyles.body.copyWith(
                          color: _isSuccess
                              ? AppColors.success
                              : _isError
                                  ? AppColors.error
                                  : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Preview extracted words
            if (_showPreview && _extractedWords.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.xxl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Preview', style: AppTextStyles.h4),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _saveAllWords,
                    icon: const Icon(Icons.save_rounded, size: 18),
                    label: const Text('Save All'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: AppColors.textOnPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              ...(_extractedWords.map((word) => Container(
                    margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                word.article != null
                                    ? '${word.article} ${word.word}'
                                    : word.word,
                                style: AppTextStyles.body.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.xs),
                              Text(
                                word.definition,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.close_rounded,
                            color: AppColors.textTertiary,
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
