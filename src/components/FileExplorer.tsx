
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Search,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  lastModified: string;
}

interface FileExplorerProps {
  currentFileName: string;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: () => void;
  onUploadFile: () => void;
  onDownloadFile: () => void;
  onRenameFile: (newName: string) => void;
  isHost: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  currentFileName,
  onCreateFile,
  onDeleteFile,
  onUploadFile,
  onDownloadFile,
  onRenameFile,
  isHost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: currentFileName,
      type: 'file',
      extension: currentFileName.split('.').pop() || 'txt',
      size: '2.1 KB',
      lastModified: '2 minutes ago'
    }
  ]);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '🟨';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'cpp':
      case 'c':
        return '⚙️';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      default:
        return '📄';
    }
  };
  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreateModalOpen(false);
      toast.success(`File "${newFileName}" created successfully`);
    }
  };

  const startEditing = (fileName: string) => {
    setEditingFile(fileName);
    setEditingName(fileName);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingName !== currentFileName) {
      onRenameFile(editingName.trim());
      toast.success(`File renamed to "${editingName}"`);
    }
    setEditingFile(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setEditingName('');
  };
  return (
    <Card className="h-full bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Files
          </CardTitle>
          <div className="flex gap-1">
            {isHost && (
              <>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      title="New File"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter file name (e.g., main.py, script.js)"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateFile();
                          }
                        }}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="text-slate-400"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateFile}
                          disabled={!newFileName.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onUploadFile}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                  title="Upload File"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadFile}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg">{getFileIcon(file.extension || '')}</span>
                  <div className="min-w-0 flex-1">
                    {editingFile === file.name ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8 text-sm bg-slate-600 border-slate-500 text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-white truncate">{file.name}</div>
                        <div className="text-xs text-slate-400">
                          {file.size} • {file.lastModified}
                        </div>
                      </>
                    )}
                  </div>
                  {file.extension && editingFile !== file.name && (
                    <Badge variant="secondary" className="text-xs">
                      {file.extension.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {isHost && file.name === currentFileName && editingFile !== file.name && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(file.name)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400"
                      title="Rename File"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDeleteFile}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredFiles.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FileExplorer;
