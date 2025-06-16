
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Users, Zap, Shield, MessageSquare, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    const newRoomId = uuidv4().substring(0, 8).toUpperCase();
    setRoomId(newRoomId);
  };

  const createRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    const newRoomId = roomId || uuidv4().substring(0, 8).toUpperCase();
    navigate(`/room/${newRoomId}?name=${encodeURIComponent(userName)}&role=host`);
  };

  const joinRoom = () => {
    if (!userName.trim() || !roomId.trim()) {
      alert('Please enter your name and room ID');
      return;
    }
    navigate(`/room/${roomId}?name=${encodeURIComponent(userName)}&role=guest`);
  };

  const features = [
    { icon: Code, title: "Real-time Editing", description: "Collaborative code editing with live cursor tracking" },
    { icon: Users, title: "30+ Languages", description: "Support for Python, JavaScript, Java, C++, and more" },
    { icon: Zap, title: "Instant Execution", description: "Run code and see results immediately" },
    { icon: Shield, title: "Secure Sessions", description: "Private rooms with permission control" },
    { icon: MessageSquare, title: "Live Chat", description: "Communicate with your team in real-time" },
    { icon: Settings, title: "Permission Control", description: "Host can manage editing permissions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Code Editor</h1>
          </div>
          <p className="text-xl text-blue-100 mb-2">Real-time collaborative code editing with 30+ languages</p>
          <div className="flex items-center justify-center gap-6 text-blue-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Instant Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">30+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Secure Execution</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                  <TabsTrigger value="create" className="data-[state=active]:bg-blue-600">Create Room</TabsTrigger>
                  <TabsTrigger value="join" className="data-[state=active]:bg-blue-600">Join Room</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="space-y-6 mt-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">Create New Room</CardTitle>
                    <CardDescription className="text-slate-300">
                      Start a new collaborative coding session
                    </CardDescription>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Room ID</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Room ID will appear here"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        />
                        <Button 
                          onClick={generateRoomId}
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={createRoom}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                      size="lg"
                    >
                      Create Room
                    </Button>
                  </div>
                  
                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-500 p-1 rounded">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-amber-400 font-medium">As Host, you will have:</h4>
                        <ul className="text-sm text-amber-200 mt-1 space-y-1">
                          <li>• Full editing access to all files</li>
                          <li>• Ability to create, delete, and share files</li>
                          <li>• Permission to promote guests to editors</li>
                          <li>• Control over room settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="join" className="space-y-6 mt-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">Join Room</CardTitle>
                    <CardDescription className="text-slate-300">
                      Enter an existing room to collaborate
                    </CardDescription>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Room ID</label>
                      <Input
                        type="text"
                        placeholder="Enter room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    
                    <Button 
                      onClick={joinRoom}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      size="lg"
                    >
                      Join Room
                    </Button>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 p-1 rounded">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-blue-400 font-medium">As Guest, you will join as:</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                              Viewer
                            </Badge>
                            <span className="text-sm text-slate-400">Read-only access initially</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-green-500 text-green-400">
                              Editor
                            </Badge>
                            <span className="text-sm text-slate-400">Host can promote you to edit files</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          The host can grant you editing permissions after you join.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/60 backdrop-blur-sm border-slate-700 hover:bg-slate-800/80 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-600/20 p-3 rounded-lg w-fit mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-6 text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="text-sm">Real-time Editing</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Live Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Code Execution</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Built with React, TypeScript, Socket.IO, and Monaco Editor
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
