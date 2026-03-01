import { ArrowLeft, Video, Phone, MoreVertical, Paperclip, Camera, Mic, Smile } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function ChatScreen() {
  const navigate = useNavigate();
  const [showDetection, setShowDetection] = useState(false);

  const handleForwardedMessage = () => {
    setShowDetection(true);
    setTimeout(() => {
      navigate('/misinfo-detected');
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:bg-white/10 rounded-full p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          </div>
          <div>
            <div className="font-medium">Rendy Del Rosario</div>
            <div className="text-xs text-gray-200">online</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Video className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-[#e5ddd5]" style={{ backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGklEQVQYlWNgYGD4T27+x4AHMDIwMDAyAABIMAP/OgAA8wAAAABJRU5ErkJggg==)', backgroundRepeat: 'repeat' }}>
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Received message */}
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">😂😂😂😂😂😂😂😂</div>
              <div className="text-xs text-gray-500 mt-1">5:09 PM</div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">Hey</div>
              <div className="text-xs text-gray-500 mt-1">5:09 PM</div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">At what time are we going to the movies?</div>
              <div className="text-xs text-gray-500 mt-1">5:10 PM</div>
            </div>
          </div>

          {/* Sent message */}
          <div className="flex justify-end">
            <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">8PM I think ...</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                5:34 PM
                <svg className="w-4 h-4" viewBox="0 0 16 15" fill="none">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Forwarded message that triggers detection */}
          <div className="flex justify-start" onClick={handleForwardedMessage}>
            <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow cursor-pointer hover:bg-gray-50">
              <div className="text-xs text-gray-500 italic mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Forwarded
              </div>
              <div className="text-sm">"BREAKING: New study shows that drinking coffee can cure all diseases. Doctors don't want you to know this! Share before it's deleted!"</div>
              <div className="text-xs text-gray-500 mt-1">5:35 PM</div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">123</div>
              <div className="text-xs text-gray-500 mt-1">5:35 PM</div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 max-w-xs shadow">
              <div className="text-sm">Cool :)</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                5:35 PM
                <svg className="w-4 h-4" viewBox="0 0 16 15" fill="none">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-2">
        <button className="p-2 hover:bg-gray-200 rounded-full">
          <Smile className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 gap-2">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 outline-none text-sm"
          />
          <Paperclip className="w-5 h-5 text-gray-600 cursor-pointer" />
          <Camera className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
        <button className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center hover:bg-[#008f6f]">
          <Mic className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}