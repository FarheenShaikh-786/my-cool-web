import React, { useEffect, useState, useRef } from 'react';

import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { Editor } from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import VideoCall from '@/components/VideoCall';
import ScheduledSessions from '@/components/ScheduledSessions';
import SchedulingModal from '@/components/SchedulingModal';
import FileExplorer from '@/components/FileExplorer';
import { 
  Users, 
  Play, 
  Copy, 
  Share, 
  Settings, 
  Crown, 
  Eye, 
  Edit3,
  Send,
  MessageSquare,
  Code,
  Terminal,
  Download,
  Upload,
  FileText,
  Calendar,
  Video,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Folder,

  LogOut
} from 'lucide-react';
import UsersPanel from '@/components/UsersPanel';
import ChatPanel from '@/components/ChatPanel';
import SidebarPanel from '@/components/SidebarPanel';
import { APP_NAME } from "@/config/app";

interface User {
  id: string;
  name: string;
  role: 'host' | 'guest';
  permission: 'viewer' | 'editor';
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface ExecutionResult {
  output: string;
  error?: string;
  time: string;
  memory: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', jdoodleId: 'nodejs', extension: 'js' },
  { value: 'python', label: 'Python', jdoodleId: 'python3', extension: 'py' },
  { value: 'java', label: 'Java', jdoodleId: 'java', extension: 'java' },
  { value: 'cpp', label: 'C++', jdoodleId: 'cpp17', extension: 'cpp' },
  { value: 'c', label: 'C', jdoodleId: 'c', extension: 'c' },
  { value: 'csharp', label: 'C#', jdoodleId: 'csharp', extension: 'cs' },
  { value: 'php', label: 'PHP', jdoodleId: 'php', extension: 'php' },
  { value: 'ruby', label: 'Ruby', jdoodleId: 'ruby', extension: 'rb' },
  { value: 'go', label: 'Go', jdoodleId: 'go', extension: 'go' },
  { value: 'rust', label: 'Rust', jdoodleId: 'rust', extension: 'rs' },
  { value: 'kotlin', label: 'Kotlin', jdoodleId: 'kotlin', extension: 'kt' },
  { value: 'swift', label: 'Swift', jdoodleId: 'swift', extension: 'swift' },
  { value: 'typescript', label: 'TypeScript', jdoodleId: 'nodejs', extension: 'ts' },
  { value: 'scala', label: 'Scala', jdoodleId: 'scala', extension: 'scala' },
  { value: 'perl', label: 'Perl', jdoodleId: 'perl', extension: 'pl' },
  { value: 'lua', label: 'Lua', jdoodleId: 'lua', extension: 'lua' },
  { value: 'haskell', label: 'Haskell', jdoodleId: 'haskell', extension: 'hs' },
  { value: 'r', label: 'R', jdoodleId: 'r', extension: 'r' },
  { value: 'dart', label: 'Dart', jdoodleId: 'dart', extension: 'dart' },
  { value: 'elixir', label: 'Elixir', jdoodleId: 'elixir', extension: 'ex' },
  { value: 'clojure', label: 'Clojure', jdoodleId: 'clojure', extension: 'clj' },
  { value: 'fsharp', label: 'F#', jdoodleId: 'fsharp', extension: 'fs' },
  { value: 'pascal', label: 'Pascal', jdoodleId: 'pascal', extension: 'pas' },
  { value: 'fortran', label: 'Fortran', jdoodleId: 'fortran', extension: 'f90' },
  { value: 'cobol', label: 'COBOL', jdoodleId: 'cobol', extension: 'cob' }
];

const DEFAULT_CODE = {
  javascript: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}! Welcome to collaborative coding.\`;
}

console.log(greet("Code Sync"));`,
  python: `# Welcome to Code Sync!
# Start typing to see real-time collaboration in action

print("Hello, World!")

def greet(name):
    return f"Hello, {name}! Welcome to collaborative coding."

print(greet("Code Sync"))`,
  java: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println(greet("Code Sync"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "! Welcome to collaborative coding.";
    }
}`,
  cpp: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "! Welcome to collaborative coding.";
}

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << greet("Code Sync") << std::endl;
    return 0;
}`,
  typescript: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

console.log("Hello, World!");

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to collaborative coding.\`;
}

console.log(greet("Code Sync"));`,
  kotlin: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

fun greet(name: String): String {
    return "Hello, $name! Welcome to collaborative coding."
}

fun main() {
    println("Hello, World!")
    println(greet("Code Sync"))
}`,
  swift: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

import Foundation

func greet(name: String) -> String {
    return "Hello, \(name)! Welcome to collaborative coding."
}

print("Hello, World!")
print(greet(name: "Code Sync"))`,
  go: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s! Welcome to collaborative coding.", name)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Println(greet("Code Sync"))
}`,
  rust: `// Welcome to Code Sync!
// Start typing to see real-time collaboration in action

fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to collaborative coding.", name)
}

fn main() {
    println!("Hello, World!");
    println!("{}", greet("Code Sync"));
}`
};

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get('name') || 'Anonymous';
  const userRole = searchParams.get('role') as 'host' | 'guest' || 'guest';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [showSchedulingPanel, setShowSchedulingPanel] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('untitled');

  const editorRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarTab, setSidebarTab] = useState<'files' | 'users' | 'chat'>('users');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://my-cool-web-production.up.railway.app', {
      query: {
        roomId,
        userName,
        userRole
      }
    });

    setSocket(newSocket);

    // Join room immediately
    newSocket.emit('joinRoom', {
      roomId,
      userName,
      userRole
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      toast.success(`Connected to room ${roomId}`);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      toast.error('Disconnected from room');
    });

    newSocket.on('userJoined', (data: { user: User; users: User[] }) => {
      console.log('User joined:', data);
      setUsers(data.users);
      if (data.user.name !== userName) {
        toast.success(`🟢 ${data.user.name} joined the room`, {
          description: `Role: ${data.user.role} | Permission: ${data.user.permission}`
        });
      }
    });

    newSocket.on('userLeft', (data: { userId: string; userName: string; users: User[] }) => {
      console.log('User left:', data);
      setUsers(data.users);
      if (data.userName) {
        toast.info(`🔴 ${data.userName} left the room`);
      }
    });

    newSocket.on('roomNotFound', () => {
      toast.error('Room not found. Only hosts can create rooms.');
    });

    newSocket.on('currentUser', (user: User) => {
      console.log('Current user set:', user);
      setCurrentUser(user);
    });

    newSocket.on('codeChange', (newCode: string) => {
      console.log('Code changed:', newCode.length);
      setCode(newCode);
    });

    newSocket.on('languageChange', (newLanguage: string) => {
      console.log('Language changed:', newLanguage);
      setLanguage(newLanguage);
      const defaultCode = DEFAULT_CODE[newLanguage as keyof typeof DEFAULT_CODE];
      if (defaultCode) {
        setCode(defaultCode);
      }
    });

    newSocket.on('chatMessage', (message: ChatMessage) => {
      console.log('Chat message received:', message);
      setChatMessages(prev => [...prev, message]);
    });

    newSocket.on('executionResult', (result: ExecutionResult) => {
      console.log('Execution result:', result);
      setExecutionResult(result);
      setIsExecuting(false);
    });

    newSocket.on('permissionChanged', (data: { userId: string; permission: 'viewer' | 'editor' }) => {
      console.log('Permission changed:', data);


      // Update users list
      setUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, permission: data.permission } : user
      ));
      // Update current user if it's them
      setCurrentUser(prev => {
        if (prev && prev.id === data.userId) {
          const updatedUser = { ...prev, permission: data.permission };
          console.log('Current user permission updated:', updatedUser);
          toast.info(`Your permission changed to ${data.permission}`, {
            description: data.permission === 'editor' ? 'You can now edit code' : 'You can only view code'
          });
          return updatedUser;
        }
        return prev;
      });
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      toast.error(error.message);
    });

    return () => {
      newSocket.close();
    };
  }, [roomId, userName, userRole]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleEditorChange = (value: string | undefined) => {
   if (value !== undefined && socket && currentUser) {
      const canEdit = currentUser.role === 'host' || currentUser.permission === 'editor';
      
      console.log('Editor change attempt:', {  
        canEdit, 
        userRole: currentUser.role, 
        userPermission: currentUser.permission,
        userId: currentUser.id,
        userName: currentUser.name
      });
      
      if (canEdit) {
        setCode(value);
        socket.emit('codeChange', { roomId, code: value });
      } else {
          toast.error('You need editor permission to modify the code', {
          description: 'Ask the host to give you editor permission'
        });
        // Revert the change in the editor
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.setValue(code);
          }
        }, 0);
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (socket && currentUser?.role === 'host') {
      setLanguage(newLanguage);
      const lang = LANGUAGES.find(l => l.value === newLanguage);
      if (lang) {
        setCurrentFileName(`untitled.${lang.extension}`);
      }
      socket.emit('languageChange', { roomId, language: newLanguage });
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('chatMessage', {
        roomId,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const executeCode = () => {
    if (socket && code.trim()) {
      setIsExecuting(true);
      setExecutionResult(null);
      socket.emit('executeCode', {
        roomId,
        code,
        language: LANGUAGES.find(l => l.value === language)?.jdoodleId || 'nodejs'
      });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    toast.success('Room ID copied to clipboard');
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}?name=${encodeURIComponent('Guest')}&role=guest`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  const toggleUserPermission = (userId: string, currentPermission: string) => {
    if (socket && currentUser?.role === 'host') {
      const newPermission = currentPermission === 'viewer' ? 'editor' : 'viewer';
      socket.emit('changePermission', {
        roomId,
        userId,
        permission: newPermission
      });
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const lang = LANGUAGES.find(l => l.value === language);
    const fileName = currentFileName.includes('.') ? currentFileName : `${currentFileName}.${lang?.extension || 'txt'}`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`File "${fileName}" downloaded successfully`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (socket && currentUser?.role === 'host') {
          setCode(content);
          setCurrentFileName(file.name);
          socket.emit('codeChange', { roomId, code: content });
          toast.success(`File "${file.name}" uploaded successfully`);
        }
      };
      reader.readAsText(file);
    }
  };

  const createNewFile = (fileName?: string) => {
    if (socket && currentUser?.role === 'host') {
       const finalFileName = fileName || (() => {
        const lang = LANGUAGES.find(l => l.value === language);
        return `untitled.${lang?.extension || 'txt'}`;
      })();
      const newCode = DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '';
      setCode(newCode);
      setCurrentFileName(finalFileName);
      socket.emit('codeChange', { roomId, code: newCode });
      toast.success(`New file "${finalFileName}" created`);
    }
  };

  const renameCurrentFile = (newName: string) => {
    if (socket && currentUser?.role === 'host') {
      setCurrentFileName(newName);
      toast.success(`File renamed to "${newName}"`);
    }
  };

  const deleteCurrentFile = () => {
    if (socket && currentUser?.role === 'host') {
      setCode('');
      setCurrentFileName('untitled');
      socket.emit('codeChange', { roomId, code: '' });
      toast.success('File deleted');
    }
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    if (socket) {
      socket.emit('startVideoCall', { roomId });
    }
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    if (socket) {
      socket.emit('endVideoCall', { roomId });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
  toast.success('Left the room');
  navigate('/');
  };

  const canEdit = currentUser?.role === 'host' || currentUser?.permission === 'editor';
  const isHost = currentUser?.role === 'host';
 
  console.log('Current user permissions:', {
    userId: currentUser?.id,
    role: currentUser?.role,
    permission: currentUser?.permission,
    canEdit
  });

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        {/* Left: Title and info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Room:</span>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {roomId}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyRoomId}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyShareLink}
              className="text-slate-400 hover:text-white"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            File: {currentFileName}
          </div>
          {/* Permission indicator */}
          <div className="flex items-center gap-2">
            <Badge variant={canEdit ? 'default' : 'secondary'} className="text-xs">
              {canEdit ? (
                <>
                  <Edit3 className="w-3 h-3 mr-1" />
                  Editor
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Viewer
                </>
              )}
            </Badge>
          </div>
        </div>
        {/* Right: Video, Schedule, Language, Run */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={isVideoCallActive ? endVideoCall : startVideoCall}
            className={`${isVideoCallActive ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'}`}
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSchedulingModalOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={!isHost}
          >
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-white hover:bg-slate-600">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={executeCode}
            disabled={isExecuting || !code.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={leaveRoom}
            className="text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>

        </div>
      </div>
      {/* Layout: Sidebar and main area */}
      <div className="flex-1 flex">
        {/* Sidebar: Tabs for Files, Users, Chat */}
        <SidebarPanel
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
          filesPanel={
            <FileExplorer
              currentFileName={currentFileName}
              onCreateFile={createNewFile}
              onDeleteFile={deleteCurrentFile}
              onUploadFile={() => fileInputRef.current?.click()}
              onDownloadFile={downloadCode}
              onRenameFile={renameCurrentFile}
              isHost={isHost}
            />
          }
          usersPanel={
            <UsersPanel
              users={users}
              isHost={isHost}
              currentUserId={currentUser?.id}
              toggleUserPermission={toggleUserPermission}
            />
          }
          chatPanel={
            <ChatPanel
              chatMessages={chatMessages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendChatMessage={sendChatMessage}
            />
          }
        />

        {/* Editor and Output area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly: !canEdit,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                lineNumbers: 'on',
                automaticLayout: true
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-64 bg-slate-800 border-t border-slate-700">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Output</h3>
              </div>
              
              <ScrollArea className="flex-1">
                {executionResult ? (
                  <div className="space-y-2">
                    {executionResult.output && (
                      <div>
                        <div className="text-sm text-green-400 mb-1">Output:</div>
                        <pre className="text-sm text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                          {executionResult.output}
                        </pre>
                      </div>
                    )}
                    {executionResult.error && (
                      <div>
                        <div className="text-sm text-red-400 mb-1">Error:</div>
                        <pre className="text-sm text-red-300 bg-slate-900 p-2 rounded overflow-x-auto">
                          {executionResult.error}
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      Execution time: {executionResult.time}ms | Memory: {executionResult.memory}KB
                    </div>
                  </div>
                ) : isExecuting ? (
                  <div className="text-slate-400">Executing code...</div>
                ) : (
                  <div className="text-slate-500">Click "Run Code" to execute your program</div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Video and Scheduling panels/modals (if open) */}
        {showVideoPanel && (
          <div className="w-80 bg-slate-800 border-l border-slate-700">
            <div className="p-4 h-full">
              <VideoCall
                isCallActive={isVideoCallActive}
                onStartCall={startVideoCall}
                onEndCall={endVideoCall}
                participants={users.filter(u => u.id !== currentUser?.id)}
              />
            </div>
          </div>
        )}
        {showSchedulingPanel && (
          <div className="w-80 bg-slate-800 border-l border-slate-700">
            <div className="p-4 h-full">
              <ScheduledSessions />
            </div>
          </div>
        )}
      </div>
      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        roomId={roomId || ''}
      />
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".js,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.txt,.html,.css,.json,.xml,.md"
      />
    </div>
  );
};

export default Room;
