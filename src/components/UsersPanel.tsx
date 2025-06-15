
import React from 'react';
import { Users, Crown, Edit3, Eye, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  role: 'host' | 'guest';
  permission: 'viewer' | 'editor';
  isOnline: boolean;
}

interface UsersPanelProps {
  users: User[];
  isHost: boolean;
  currentUserId?: string;
  toggleUserPermission: (userId: string, permission: string) => void;
}

const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  isHost,
  currentUserId,
  toggleUserPermission,
}) => (
  <Card className="h-full bg-slate-800 border-slate-700 rounded-none">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <Users className="w-5 h-5" />
        Users ({users.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded bg-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className={`text-sm ${user.id === currentUserId ? 'text-blue-200' : 'text-white'}`}>{user.name} {user.id === currentUserId && '(You)'}</span>
                {user.role === 'host' && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              <div className="flex items-center gap-1">
                <Badge
                  variant={user.permission === 'editor' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    user.permission === 'editor'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {user.permission === 'editor' ? (
                    <Edit3 className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Badge>
                {isHost && user.role !== 'host' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleUserPermission(user.id, user.permission)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export default UsersPanel;
