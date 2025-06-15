
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  onCreateFile: () => void;
  onDeleteFile: () => void;
  onUploadFile: () => void;
  onDownloadFile: () => void;
  isHost: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  currentFileName,
  onCreateFile,
  onDeleteFile,
  onUploadFile,
  onDownloadFile,
  isHost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCreateFile}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                  title="New File"
                >
                  <Plus className="w-4 h-4" />
                </Button>
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
                    <div className="text-sm text-white truncate">{file.name}</div>
                    <div className="text-xs text-slate-400">
                      {file.size} • {file.lastModified}
                    </div>
                  </div>
                  {file.extension && (
                    <Badge variant="secondary" className="text-xs">
                      {file.extension.toUpperCase()}
                    </Badge>
                  )}
                </div>
                {isHost && file.name === currentFileName && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDeleteFile}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
