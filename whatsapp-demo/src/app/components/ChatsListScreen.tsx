import { Search, MoreVertical, MessageSquare, Camera } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar: string;
  isBot?: boolean;
}

export function ChatsListScreen() {
  const navigate = useNavigate();

  const chats: Chat[] = [
    {
      id: 'femstral',
      name: 'Femstral',
      lastMessage: 'Thank you for using verification services. Feel free to send any suspicious content.',
      time: '5:38 PM',
      avatar: 'bot',
      isBot: true,
    },
    {
      id: 'rendy',
      name: 'Rendy Del Rosario',
      lastMessage: 'Cool :)',
      time: '5:35 PM',
      avatar: 'gradient-blue',
    },
    {
      id: 'mom',
      name: 'Mom',
      lastMessage: 'Don\'t forget to buy groceries',
      time: '4:12 PM',
      unread: 2,
      avatar: 'gradient-pink',
    },
    {
      id: 'work-group',
      name: 'Work Team',
      lastMessage: 'Sarah: Meeting at 3pm tomorrow',
      time: '3:45 PM',
      avatar: 'gradient-green',
    },
    {
      id: 'john',
      name: 'John Smith',
      lastMessage: 'Thanks! See you then',
      time: '2:30 PM',
      avatar: 'gradient-orange',
    },
    {
      id: 'fitness',
      name: 'Fitness Buddies',
      lastMessage: 'Mike: Who\'s up for a run tomorrow?',
      time: 'Yesterday',
      unread: 5,
      avatar: 'gradient-purple',
    },
    {
      id: 'sarah',
      name: 'Sarah Johnson',
      lastMessage: 'That sounds great!',
      time: 'Yesterday',
      avatar: 'gradient-teal',
    },
    {
      id: 'dad',
      name: 'Dad',
      lastMessage: 'Call me when you get home',
      time: 'Yesterday',
      avatar: 'gradient-indigo',
    },
  ];

  const handleChatClick = (chatId: string) => {
    if (chatId === 'femstral') {
      navigate('/agent-chat');
    } else if (chatId === 'rendy') {
      navigate('/chat');
    } else {
      // For demo purposes, other chats just navigate to the main chat screen
      navigate('/chat');
    }
  };

  const getAvatarStyle = (avatar: string) => {
    const styles: Record<string, string> = {
      'gradient-blue': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'gradient-pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
      'gradient-green': 'bg-gradient-to-br from-green-400 to-green-600',
      'gradient-orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'gradient-purple': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'gradient-teal': 'bg-gradient-to-br from-teal-400 to-teal-600',
      'gradient-indigo': 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    };
    return styles[avatar] || 'bg-gray-400';
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium">WhatsApp</h1>
          <div className="flex items-center gap-6">
            <Camera className="w-5 h-5 cursor-pointer" />
            <Search className="w-5 h-5 cursor-pointer" />
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="flex-1 outline-none text-sm text-gray-800"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
          >
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${chat.isBot ? 'bg-gradient-to-br from-blue-500 to-purple-600' : getAvatarStyle(chat.avatar)}`}>
              {chat.isBot ? (
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="4" y="8" width="16" height="12" rx="2" strokeWidth="2"/>
                  <circle cx="9" cy="13" r="1" fill="currentColor"/>
                  <circle cx="15" cy="13" r="1" fill="currentColor"/>
                  <path d="M9 16c.5.7 1.5 1 3 1s2.5-.3 3-1" strokeWidth="2"/>
                </svg>
              ) : null}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {chat.name}
                  {chat.isBot && (
                    <svg className="w-4 h-4 inline ml-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                {chat.unread && (
                  <span className="bg-[#00a884] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="absolute bottom-6 right-6 w-14 h-14 bg-[#00a884] rounded-full shadow-lg flex items-center justify-center hover:bg-[#008f6f] transition-colors">
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
