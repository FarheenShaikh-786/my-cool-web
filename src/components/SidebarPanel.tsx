
import React from 'react';
import { Files, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Tab = 'files' | 'users' | 'chat';

interface SidebarPanelProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  filesPanel: React.ReactNode;
  usersPanel: React.ReactNode;
  chatPanel: React.ReactNode;
}

const sidebarTabs = [
  { tab: 'files', label: 'Files', icon: Files },
  { tab: 'users', label: 'Users', icon: Users },
  { tab: 'chat',  label: 'Chat',  icon: MessageSquare },
] as const;

const SidebarPanel: React.FC<SidebarPanelProps> = ({
  activeTab,
  setActiveTab,
  filesPanel,
  usersPanel,
  chatPanel,
}) => {
  return (
    <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-slate-700">
        {sidebarTabs.map(({ tab, label, icon: Icon }) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex-1 flex flex-col items-center px-2 py-1 ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'files' && filesPanel}
        {activeTab === 'users' && usersPanel}
        {activeTab === 'chat' && chatPanel}
      </div>
    </aside>
  );
};

export default SidebarPanel;
