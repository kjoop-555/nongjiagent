import React, { useState } from 'react';
import { History, PlusCircle, Settings, LogOut, User, Tractor, Trash2, MessageSquare, BrainCircuit } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (e: React.MouseEvent, sessionId: string) => void;
  username: string;
  onLogout: () => void;
  onBatchDelete: (ids: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  isOpen, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onDeleteSession,
  username,
  onLogout,
  onBatchDelete,
}) => {
    const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定删除 ${selectedIds.length} 条记录？`)) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
      setBatchMode(false);
    }
  };
  return (
    <div className={`${isOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col border-r border-slate-700/50 h-full flex-shrink-0 relative shadow-2xl z-20`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-white/5 backdrop-blur-sm">
  <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-lg">
  <img 
    src="/25d49b56650c80ff234bef802d5a082d.png" 
    alt="校徽1" 
    className="w-8 h-8 object-contain"
  />
  <img 
    src="/de58c87c8a2a7af1c174229883d940c0.png" 
    alt="校徽2" 
    className="w-8 h-8 object-contain"
  />
  
</div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white">机芯</h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">农机运维管理大模型 1.0</p>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-5">
        <button 
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-500/25 group border border-emerald-400/20"
        >
          <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">新建任务 / 诊断</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-hide py-2">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3 px-3">
  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    历史对话 ({sessions.length})
  </h3>
  {sessions.length > 0 && (
    <div className="gap-2 flex">
      {!batchMode ? (
        <button onClick={() => setBatchMode(true)} className="text-[10px] text-red-400">
          批量删除
        </button>
      ) : (
        <>
        <button onClick={() => {
  setSelectedIds(sessions.map(s => s.id));
}} className="text-[10px] text-emerald-400">
  全选
</button>

<button onClick={() => {
  setSelectedIds([]);
}} className="text-[10px]">
  取消全选
</button>
          <button onClick={() => { setBatchMode(false); setSelectedIds([]); }} className="text-[10px]">
            取消
          </button>
          <button onClick={handleBatchDelete} className="text-[10px] text-red-400">
            删除选中
          </button>
        </>
      )}
    </div>
  )}
</div>
          
          {sessions.length === 0 ? (
            <div className="text-slate-500 text-sm px-4 py-8 text-center italic bg-white/5 rounded-xl border border-dashed border-white/10 mx-2">
              暂无历史记录<br/>开启智能运维新篇章
            </div>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li 
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={`group relative px-4 py-3 rounded-xl cursor-pointer text-sm flex items-center gap-3 transition-all duration-200 border ${
                    currentSessionId === session.id 
                      ? 'bg-white/10 text-white border-white/10 shadow-lg backdrop-blur-sm' 
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-white/5'
                  }`}
                >
                  {batchMode && (
  <input
    type="checkbox"
    checked={selectedIds.includes(session.id)}
    onChange={(e) => { e.stopPropagation(); toggleSelect(session.id); }}
    className="w-4 h-4 accent-emerald-500"
  />
)}
                  <MessageSquare 
                    size={16} 
                    className={currentSessionId === session.id ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"} 
                  /> 
                  <span className="truncate flex-1 font-medium">{session.title}</span>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => onDeleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
                    title="删除记录"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  {/* Active Indicator Bar */}
                  {currentSessionId === session.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

  

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border border-white/10 shadow-inner">
            <User size={18} className="text-slate-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username}</p>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] text-slate-300 truncate tracking-wide">高级订阅版</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-400">
          <button className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-medium border border-transparent hover:border-white/10">
            <Settings size={14} /> 设置
          </button>
          <button 
            onClick={onLogout}
            className="p-2 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-medium border border-transparent hover:border-red-500/20" 
          >
            <LogOut size={14} /> 退出
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;