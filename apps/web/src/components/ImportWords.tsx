import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, File, AlertCircle, CheckCircle, Loader2, Brain, Sparkles, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFolders } from '../hooks/useFolders';
import { useImportWords } from '../hooks/useImportWords';
import * as pdfjs from 'pdfjs-dist';

interface ImportWordsProps {
  onNavigate: (view: string) => void;
  currentView?: string;
}

interface PreviewWord {
  word: string;
  definition: string;
  article?: string;
}

// Set up the worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export const ImportWords: React.FC<ImportWordsProps> = ({ onNavigate, currentView }) => {
  // Ensure the currentView prop is acknowledged to avoid unused variable compile errors
  useEffect(() => {
    /* currentView prop currently does not influence this component's behavior,
       but we track it here to comply with the project's strict no-unused rules. */
  }, [currentView]);

  const { user } = useAuth();
  const { folders, addFolder } = useFolders(user);
  const { importWordsFromFile, confirmImportWords, loading, error } = useImportWords();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [previewWords, setPreviewWords] = useState<PreviewWord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'reading' | 'processing' | 'complete'>('idle');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#fca311');
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderColors = [
    '#fca311', '#14213d', '#2a9d8f', '#e76f51', '#f4a261',
    '#e9c46a', '#264653', '#2a9d8f', '#e76f51', '#f4a261'
  ];

  const acceptedFileTypes = '.csv,.pdf,.txt';
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['csv', 'pdf', 'txt'].includes(fileExtension || '')) {
      alert('Please select a CSV, PDF, or TXT file');
      return;
    }

    setSelectedFile(file);
    setProcessingStep('reading');

    try {
      if (fileExtension === 'pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= doc.numPages; i++) {
              const page = await doc.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ');
              fullText += pageText + ' ';
            }
            setFileContent(fullText.trim());
            setProcessingStep('idle');
          } catch (pdfError) {
            console.error('Error parsing PDF:', pdfError);
            alert('Failed to read PDF content. The file might be corrupted or image-based.');
            setProcessingStep('idle');
            setSelectedFile(null);
          }
        };
        reader.onerror = () => {
          alert('Error reading PDF file. Please try again.');
          setProcessingStep('idle');
          setSelectedFile(null);
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Handle CSV and TXT files
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFileContent(content);
          setProcessingStep('idle');
        };
        reader.onerror = () => {
          alert('Error reading file. Please try again.');
          setProcessingStep('idle');
          setSelectedFile(null);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error handling file select:', error);
      alert('An unexpected error occurred.');
      setProcessingStep('idle');
      setSelectedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simulate file input change
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleProcessFile = async (isContinuation = false) => {
    if (!selectedFile || !fileContent.trim()) return;

    setProcessingStep('processing');
    if (!isContinuation) {
      setShowPreview(false);
    }

    try {
      const existingWords = isContinuation ? previewWords.map(w => w.word) : [];
      // Use preview mode to extract words without saving to database
      const result = await importWordsFromFile(fileContent, selectedFile.type, selectedFolderIds, existingWords, true);
      
      if (result.success && result.words) {
        const newWords = result.words || [];
        setPreviewWords(prev => isContinuation ? [...prev, ...newWords] : newWords);
        setShowPreview(true);
        setProcessingStep('complete');
      } else {
        throw new Error(result.error || 'Failed to process file');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      // Only reset if it's not a continuation, to allow for retries.
      if (!isContinuation) {
        setProcessingStep('idle');
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!previewWords.length) return;
    
    setProcessingStep('processing');
    
    try {
      // If in select mode, only import selected words, otherwise import all
      const wordsToImport = isSelectMode 
        ? previewWords.filter((_, index) => selectedWordIndices.has(index))
        : previewWords;
        
      if (wordsToImport.length === 0) {
        setProcessingStep('complete');
        return;
      }
      
      const result = await confirmImportWords(wordsToImport, selectedFolderIds);
      
      if (result.success) {
        // Successfully imported words, navigate to word list
        onNavigate('word-list');
      } else {
        throw new Error(result.error || 'Failed to confirm import');
      }
    } catch (err) {
      console.error('Error confirming import:', err);
      setProcessingStep('complete'); // Return to preview state
    }
  };

  const handleAddNewFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await addFolder({
        name: newFolderName.trim(),
        color: newFolderColor,
      });

      if (newFolder) {
        setSelectedFolderIds(prev => [...prev, newFolder.id]);
      }

      setNewFolderName('');
      setNewFolderColor('#fca311');
      setShowNewFolderInput(false);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const removeFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => prev.filter(id => id !== folderId));
  };

  const toggleWordSelection = (index: number) => {
    setSelectedWordIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWordIndices.size === previewWords.length) {
      // Deselect all
      setSelectedWordIndices(new Set());
    } else {
      // Select all
      setSelectedWordIndices(new Set(previewWords.map((_, index) => index)));
    }
  };

  const enterSelectMode = () => {
    setIsSelectMode(true);
    // Start with all words selected
    setSelectedWordIndices(new Set(previewWords.map((_, index) => index)));
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedWordIndices(new Set());
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileContent('');
    setSelectedFolderIds([]);
    setPreviewWords([]);
    setShowPreview(false);
    setProcessingStep('idle');
    setIsSelectMode(false);
    setSelectedWordIndices(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-highlight rounded-full mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-navy mb-2">AI-Powered Word Import</h1>
            <p className="text-primary-text max-w-2xl mx-auto">
              Upload your documents and let our AI automatically extract vocabulary words and create flashcards for you. 
              Supports CSV, PDF, and text files.
            </p>
          </div>
        </div>

        {/* File Upload Section */}
        {!showPreview && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg mb-6">
            <h2 className="text-xl font-semibold text-primary-navy mb-6 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Document
            </h2>

            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-primary-bg hover:border-primary-highlight bg-primary-cream/30'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-navy">{selectedFile.name}</h3>
                    <p className="text-sm text-primary-text/70">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="p-3 bg-primary-highlight/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary-highlight" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-navy mb-2">
                      Drop your file here or click to browse
                    </h3>
                    <p className="text-sm text-primary-text/70 mb-4">
                      Supports CSV, PDF, and TXT files up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={acceptedFileTypes}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-primary-highlight text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* File Format Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-primary-cream/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary-highlight mr-3" />
                <div>
                  <h4 className="font-medium text-primary-navy text-sm">CSV Files</h4>
                  <p className="text-xs text-primary-text/70">Structured word lists</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-primary-cream/50 rounded-lg">
                <File className="h-5 w-5 text-primary-highlight mr-3" />
                <div>
                  <h4 className="font-medium text-primary-navy text-sm">PDF Documents</h4>
                  <p className="text-xs text-primary-text/70">Extract from articles</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-primary-cream/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary-highlight mr-3" />
                <div>
                  <h4 className="font-medium text-primary-navy text-sm">Text Files</h4>
                  <p className="text-xs text-primary-text/70">Plain text content</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        {selectedFile && !showPreview && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg mb-6">
            <h2 className="text-xl font-semibold text-primary-navy mb-6">
              Organize Into Folders (Optional)
            </h2>
            
            {/* Selected Folders */}
            {selectedFolderIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedFolderIds.map(folderId => {
                  const folder = folders.find(f => f.id === folderId);
                  if (!folder) return null;
                  
                  return (
                    <span
                      key={folderId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: folder.color }}
                    >
                      {folder.name}
                      <button
                        type="button"
                        onClick={() => removeFolderSelection(folderId)}
                        className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Folder Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => toggleFolderSelection(folder.id)}
                  className={`
                    flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${selectedFolderIds.includes(folder.id)
                      ? 'border-primary-highlight bg-primary-highlight/10'
                      : 'border-primary-bg hover:border-primary-highlight/50 bg-primary-cream/30'
                    }
                  `}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-sm font-medium text-primary-text truncate">
                    {folder.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Add New Folder */}
            {!showNewFolderInput ? (
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="flex items-center text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 text-sm font-medium"
              >
                <Upload className="h-4 w-4 mr-1" />
                Create New Folder
              </button>
            ) : (
              <div className="bg-primary-cream/50 rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="flex-1 px-3 py-2 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-colors duration-200 bg-white text-primary-text text-sm"
                  />
                  <div className="flex gap-1">
                    {folderColors.slice(0, 5).map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          newFolderColor === color ? 'border-primary-text scale-110' : 'border-white'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNewFolder}
                    disabled={!newFolderName.trim()}
                    className="px-3 py-1 bg-primary-highlight text-white rounded text-sm font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                      setNewFolderColor('#fca311');
                    }}
                    className="px-3 py-1 text-primary-text hover:text-primary-highlight transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Section */}
        {selectedFile && !showPreview && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg mb-6">
            <h2 className="text-xl font-semibold text-primary-navy mb-6 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              AI Processing
            </h2>

            {/* Processing Steps */}
            <div className="space-y-4 mb-6">
              <div className={`flex items-center p-3 rounded-lg ${
                processingStep === 'reading' ? 'bg-blue-50 border border-blue-200' : 
                fileContent ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  processingStep === 'reading' ? 'bg-blue-500' :
                  fileContent ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {processingStep === 'reading' ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : fileContent ? (
                    <CheckCircle className="h-3 w-3 text-white" />
                  ) : (
                    <span className="text-white text-xs">1</span>
                  )}
                </div>
                <span className="text-sm font-medium text-primary-navy">
                  {processingStep === 'reading' ? 'Reading file...' : 
                   fileContent ? 'File read successfully' : 'Read file content'}
                </span>
              </div>

              <div className={`flex items-center p-3 rounded-lg ${
                processingStep === 'processing' ? 'bg-blue-50 border border-blue-200' : 
                showPreview ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  processingStep === 'processing' ? 'bg-blue-500' :
                  showPreview ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {processingStep === 'processing' ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : showPreview ? (
                    <CheckCircle className="h-3 w-3 text-white" />
                  ) : (
                    <span className="text-white text-xs">2</span>
                  )}
                </div>
                <span className="text-sm font-medium text-primary-navy">
                  {processingStep === 'processing' ? 'AI extracting vocabulary...' : 
                   showPreview ? 'Words extracted successfully' : 'Extract vocabulary with AI'}
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">Processing Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleProcessFile()}
                disabled={!fileContent.trim() || loading || processingStep !== 'idle'}
                className="flex-1 bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {processingStep === 'processing' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Extract Words with AI
                  </>
                )}
              </button>
              
              <button
                onClick={resetForm}
                disabled={loading || processingStep === 'processing'}
                className="px-6 py-3 border border-primary-bg text-primary-text rounded-lg font-medium hover:bg-primary-cream/50 disabled:opacity-50 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {showPreview && previewWords.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-primary-bg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary-navy flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Extracted Words ({previewWords.length})
                {isSelectMode && (
                  <span className="ml-2 text-sm text-primary-highlight">
                    ({selectedWordIndices.size} selected)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                {!isSelectMode ? (
                  <button
                    onClick={enterSelectMode}
                    className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200 px-3 py-1 border border-primary-highlight rounded-md"
                  >
                    Select
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-primary-highlight hover:text-primary-highlight/80 transition-colors duration-200"
                    >
                      {selectedWordIndices.size === previewWords.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={exitSelectMode}
                      className="text-sm text-primary-text hover:text-primary-highlight transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  onClick={resetForm}
                  className="text-sm text-primary-text hover:text-primary-highlight transition-colors duration-200"
                >
                  Process Another File
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Preview Ready!</strong> AI has successfully extracted {previewWords.length} vocabulary words from your document. 
                Review them below and click "Add to My Words" to save them to your collection.
              </p>
            </div>

            {/* Words Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto">
              {previewWords.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isSelectMode
                      ? selectedWordIndices.has(index)
                        ? 'bg-primary-highlight/10 border-primary-highlight cursor-pointer'
                        : 'bg-primary-cream/40 border-primary-bg cursor-pointer hover:border-primary-highlight/50'
                      : 'bg-primary-cream/40 border-primary-bg'
                  }`}
                  onClick={isSelectMode ? () => toggleWordSelection(index) : undefined}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-navy">
                        {item.article && <span className="text-primary-highlight mr-2">{item.article}</span>}
                        {item.word}
                      </h3>
                      <p className="text-sm text-primary-text">{item.definition}</p>
                    </div>
                    {isSelectMode && (
                      <div className="ml-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedWordIndices.has(index)}
                          onChange={() => toggleWordSelection(index)}
                          className="w-4 h-4 text-primary-highlight bg-gray-100 border-gray-300 rounded focus:ring-primary-highlight focus:ring-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8">
              <button
                onClick={() => handleProcessFile(true)}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-highlight bg-primary-highlight/10 hover:bg-primary-highlight/20 disabled:bg-gray-100 disabled:text-gray-500 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Keep Generating
                  </>
                )}
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={loading || processingStep === 'processing' || (isSelectMode && selectedWordIndices.size === 0)}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-highlight hover:bg-primary-highlight/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {processingStep === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Adding to Library...
                  </>
                ) : isSelectMode ? (
                  selectedWordIndices.size === 0 
                    ? 'Select Words to Add'
                    : selectedWordIndices.size === 1
                    ? 'Add Selected Word'
                    : `Add ${selectedWordIndices.size} Selected Words`
                ) : (
                  'Add All Words'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedFile && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-highlight/10 rounded-full mb-6">
              <Brain className="h-10 w-10 text-primary-highlight" />
            </div>
            <h3 className="text-xl font-medium text-primary-navy mb-2">Ready to Import Words?</h3>
            <p className="text-primary-text/70 max-w-md mx-auto">
              Upload your documents and let AI do the heavy lifting. Perfect for importing vocabulary from articles, 
              textbooks, or any text-based content.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};