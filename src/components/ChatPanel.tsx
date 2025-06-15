
import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  chatMessages: ChatMessage[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  sendChatMessage: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  chatMessages,
  newMessage,
  setNewMessage,
  sendChatMessage,
}) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Card className="h-full bg-slate-800 border-slate-700 rounded-none flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full flex-1">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-3" ref={chatScrollRef}>
            {chatMessages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="text-blue-400 font-medium">{message.userName}</div>
                <div className="text-slate-300">{message.message}</div>
                <div className="text-xs text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <div className="text-slate-500 text-sm">No messages yet...</div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Type a message..."
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Button
            size="sm"
            onClick={sendChatMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
