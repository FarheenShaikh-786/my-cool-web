
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledSession {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: number;
  roomId: string;
  createdAt: Date;
}

const ScheduledSessions = () => {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const stored = localStorage.getItem('scheduledSessions');
    if (stored) {
      const parsed = JSON.parse(stored).map((session: any) => ({
        ...session,
        date: new Date(session.date),
        createdAt: new Date(session.createdAt)
      }));
      setSessions(parsed);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('scheduledSessions', JSON.stringify(updatedSessions));
    toast.success('Session deleted');
  };

  const joinSession = (session: ScheduledSession) => {
    const now = new Date();
    const sessionDateTime = new Date(session.date);
    const [hours, minutes] = session.time.split(':');
    sessionDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff > 15) {
      toast.error(`Session starts in ${minutesDiff} minutes`);
      return;
    }
    
    window.open(`/room/${session.roomId}?name=Participant&role=guest`, '_blank');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSessionStatus = (session: ScheduledSession) => {
    const now = new Date();
    const sessionDateTime = new Date(session.date);
    const [hours, minutes] = session.time.split(':');
    sessionDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff < -session.duration) {
      return { status: 'completed', color: 'bg-gray-500' };
    } else if (minutesDiff <= 15 && minutesDiff >= -session.duration) {
      return { status: 'live', color: 'bg-green-500' };
    } else if (minutesDiff <= 60) {
      return { status: 'soon', color: 'bg-yellow-500' };
    } else {
      return { status: 'scheduled', color: 'bg-blue-500' };
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No scheduled sessions
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const { status, color } = getSessionStatus(session);
                return (
                  <div
                    key={session.id}
                    className="p-3 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{session.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={`${color} text-white`}>
                          {status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSession(session.id)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-slate-300 mb-2">{session.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </span>
                      <span>{session.duration}min</span>
                    </div>
                    
                    {(status === 'live' || status === 'soon') && (
                      <Button
                        size="sm"
                        onClick={() => joinSession(session)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {status === 'live' ? 'Join Now' : 'Join Session'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScheduledSessions;
