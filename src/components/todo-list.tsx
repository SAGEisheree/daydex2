'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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

export function TodoList({ userId }: { userId: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('day');
  
  const supabase = createClient();

  useEffect(() => {
    fetchTodos();
  }, []);

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
    if (!newTaskTitle.trim()) return;

    const newTodo = {
      user_id: userId,
      title: newTaskTitle,
      timeframe: activeTab,
      is_completed: false,
    };

    // Optimistic UI
    const tempId = crypto.randomUUID();
    setTodos([{ id: tempId, ...newTodo } as Todo, ...todos]);
    setNewTaskTitle('');

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (data) {
      setTodos(prev => prev.map(t => t.id === tempId ? data : t));
    }
  }

  async function toggleTodo(id: string, currentStatus: boolean) {
    setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    
    await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);
  }

  async function deleteTodo(id: string) {
    setTodos(todos.filter(t => t.id !== id));
    await supabase.from('todos').delete().eq('id', id);
  }

  const filteredTodos = todos.filter(t => t.timeframe === activeTab);

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Goals & Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-zinc-100">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <Input
              placeholder={`Add a ${activeTab} task...`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-zinc-50/50 text-sm"
            />
            <Button type="submit" size="icon" variant="secondary" disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-3 min-h-[200px]">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))
            ) : filteredTodos.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">
                No tasks for this {activeTab} yet.
              </p>
            ) : (
              filteredTodos.map((todo) => (
                <div key={todo.id} className="flex items-start gap-3 group">
                  <Checkbox 
                    id={`todo-${todo.id}`} 
                    checked={todo.is_completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.is_completed)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 flex-1 leading-none">
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`text-sm font-medium leading-normal cursor-pointer transition-colors ${
                        todo.is_completed ? 'text-zinc-400 line-through' : 'text-zinc-900'
                      }`}
                    >
                      {todo.title}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 text-zinc-400 hover:text-red-500 transition-opacity"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
