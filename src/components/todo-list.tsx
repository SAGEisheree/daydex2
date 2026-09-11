'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
  timeframe: 'day' | 'week' | 'month' | 'year';
}

export function TodoList({ userId, isOwner = true }: { userId: string; isOwner?: boolean }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('day');

  const supabase = createClient();

  useEffect(() => {
    fetchTodos();
  }, [userId]);

  async function fetchTodos() {
    setLoading(true);
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setTodos(data);
    setLoading(false);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !isOwner) return;

    const newTodo = {
      user_id: userId,
      title: newTaskTitle,
      timeframe: activeTab,
      is_completed: false,
    };

    const tempId = crypto.randomUUID();
    setTodos([{ id: tempId, ...newTodo } as Todo, ...todos]);
    setNewTaskTitle('');

    const { data } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (data) {
      setTodos(prev => prev.map(t => t.id === tempId ? data : t));
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean) {
    if (!isOwner) return;
    setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

    await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);
  }

  async function deleteTodo(id: string) {
    if (!isOwner) return;
    setTodos(todos.filter(t => t.id !== id));
    await supabase.from('todos').delete().eq('id', id);
  }

  const filteredTodos = todos.filter(t => t.timeframe === activeTab);

  return (
    <div className="bg-[#edf2f7] rounded-xl p-5 border border-slate-200/60 shadow-xs space-y-4">
      <h3 className="font-serif font-bold text-xl text-slate-800 tracking-tight">Goals & Tasks</h3>

      <Tabs defaultValue="day" onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-3">
        <TabsList className="bg-white rounded-full p-1 border border-slate-200/80 shadow-xs flex justify-between h-auto w-full">
          <TabsTrigger
            value="day"
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all cursor-pointer flex-1 text-center"
          >
            Day
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all cursor-pointer flex-1 text-center"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all cursor-pointer flex-1 text-center"
          >
            Month
          </TabsTrigger>
          <TabsTrigger
            value="year"
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition-all cursor-pointer flex-1 text-center"
          >
            Year
          </TabsTrigger>
        </TabsList>

        {isOwner && (
          <form onSubmit={addTodo} className="flex gap-2 items-center">
            <Input
              placeholder={`Add a ${activeTab} task...`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-white/90 border-0 shadow-xs text-xs rounded-full px-4 h-9 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!newTaskTitle.trim()}
              className="h-8 w-8 shrink-0 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="space-y-2 min-h-[120px] pt-1">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : filteredTodos.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-sans">
              No tasks for this {activeTab} yet.
            </p>
          ) : (
            filteredTodos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between gap-2 group py-1">
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id, todo.is_completed)}
                  className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
                >
                  {todo.is_completed ? (
                    <div className="w-4 h-4 rounded bg-slate-900 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white shrink-0 group-hover:border-slate-400 transition-colors" />
                  )}
                  <span
                    className={`text-xs font-medium truncate transition-colors ${
                      todo.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {todo.title}
                  </span>
                </button>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
