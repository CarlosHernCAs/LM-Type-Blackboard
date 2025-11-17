'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations');
      return response.data;
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const newSocket = io('http://localhost:4000', {
      auth: { token },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.emit('join-conversation', selectedUser.other_user_id);

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leave-conversation', selectedUser.other_user_id);
      socket.off('new-message');
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    api.get(`/messages/${selectedUser.other_user_id}`).then((res) => {
      setMessages(res.data);
    });
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    await api.post('/messages', {
      recipientId: selectedUser.other_user_id,
      content: message,
    });

    setMessage('');
  };

  const roleBasedLayout = user?.role === 'student' ? 'student' : user?.role === 'teacher' ? 'teacher' : user?.role === 'admin' ? 'admin' : 'parent';

  return (
    <DashboardLayout role={roleBasedLayout as any}>
      <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Mensajes</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations?.map((conv: any) => (
              <div
                key={conv.other_user_id}
                onClick={() => setSelectedUser(conv)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedUser?.other_user_id === conv.other_user_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {conv.first_name?.[0]}{conv.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.first_name} {conv.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg: any, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selecciona una conversación para comenzar
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
