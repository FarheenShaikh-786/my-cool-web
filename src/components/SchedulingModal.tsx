
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const SchedulingModal = ({ isOpen, onClose, roomId }: SchedulingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleScheduleSession = () => {
    if (!selectedDate || !selectedTime || !sessionTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduledSession = {
      id: Date.now().toString(),
      title: sessionTitle,
      description,
      date: selectedDate,
      time: selectedTime,
      duration: parseInt(duration),
      roomId,
      createdAt: new Date()
    };

    // Save to localStorage (in production, save to backend)
    const existingSessions = JSON.parse(localStorage.getItem('scheduledSessions') || '[]');
    existingSessions.push(scheduledSession);
    localStorage.setItem('scheduledSessions', JSON.stringify(existingSessions));

    toast.success('Session scheduled successfully!');
    onClose();
    
    // Reset form
    setSessionTitle('');
    setDescription('');
    setSelectedTime('');
    setDuration('60');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Coding Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Code review session"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will you be working on?"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="time">Time *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Select Date *</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleScheduleSession}>
            Schedule Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulingModal;
