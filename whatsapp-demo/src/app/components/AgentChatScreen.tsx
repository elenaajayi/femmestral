import { ArrowLeft, Video, Phone, MoreVertical, ExternalLink, AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

export function AgentChatScreen() {
  const navigate = useNavigate();
  const [showTyping, setShowTyping] = useState(true);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    // Simulate agent typing
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowResponse(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:bg-white/10 rounded-full p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="4" y="8" width="16" height="12" rx="2" strokeWidth="2"/>
              <circle cx="9" cy="13" r="1" fill="currentColor"/>
              <circle cx="15" cy="13" r="1" fill="currentColor"/>
              <path d="M9 16c.5.7 1.5 1 3 1s2.5-.3 3-1" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div className="font-medium">Femstral Verification</div>
            <div className="text-xs text-gray-200">
              {showTyping ? 'typing...' : 'online'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Video className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#e5ddd5]" style={{ backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGklEQVQYlWNgYGD4T27+x4AHMDIwMDAyAABIMAP/OgAA8wAAAABJRU5ErkJggg==)', backgroundRepeat: 'repeat' }}>
        <div className="max-w-3xl mx-auto space-y-3">
          {/* User's forwarded message */}
          <div className="flex justify-end">
            <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 max-w-md shadow">
              <div className="text-xs text-gray-600 italic mb-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Forwarded for verification
              </div>
              <div className="text-sm mb-1">
                "BREAKING: New study shows that drinking coffee can cure all diseases. Doctors don't want you to know this! Share before it's deleted!"
              </div>
              <div className="text-xs text-gray-600 mt-2 bg-white/50 rounded p-2 mb-2">
                📸 [Image attached showing medical claims]
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                5:37 PM
                <svg className="w-4 h-4" viewBox="0 0 16 15" fill="none">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Agent acknowledgment */}
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 max-w-md shadow">
              <div className="text-sm">
                Thank you for submitting this for verification. I'm analyzing the content and checking reliable sources...
              </div>
              <div className="text-xs text-gray-500 mt-2">5:37 PM</div>
            </div>
          </div>

          {/* Typing indicator */}
          {showTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-3 shadow">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Agent detailed response */}
          {showResponse && (
            <>
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-4 max-w-md shadow">
                  {/* Verdict Header */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-gray-800">Verdict: False</div>
                      <div className="text-xs text-gray-500">Confidence Level: High</div>
                    </div>
                  </div>

                  {/* Why Section */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Why:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>The claim that coffee can "cure all diseases" is medically inaccurate and not supported by scientific evidence.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>The phrase "doctors don't want you to know" is a common misinformation tactic.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>No credible medical organization has made such statements about coffee.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>The urgency to "share before it's deleted" is designed to bypass critical thinking.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Sources Section */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Sources:
                    </h3>
                    <div className="space-y-2 text-xs">
                      <a href="#" className="block text-blue-600 hover:underline">
                        → Mayo Clinic: Coffee and Health Facts
                      </a>
                      <a href="#" className="block text-blue-600 hover:underline">
                        → WHO: Nutrition and Health Claims
                      </a>
                      <a href="#" className="block text-blue-600 hover:underline">
                        → Snopes: Coffee Health Misinformation
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">5:38 PM</div>
                </div>
              </div>

              {/* Additional context */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-3 max-w-md shadow">
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">While coffee does have some health benefits when consumed in moderation, it is not a cure for diseases. Always consult healthcare professionals for medical advice.</p>
                    <p className="text-amber-700 font-medium">⚠️ Recommendation: Do not share this message.</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">5:38 PM</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-3 max-w-md shadow">
                  <p className="text-sm text-gray-700 mb-3">Would you like to:</p>
                  <div className="space-y-2">
                    <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Report as Misinformation
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">5:38 PM</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom info banner */}
      <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
        <div className="flex items-start gap-2 text-xs text-yellow-800 max-w-3xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            This analysis is provided by Femstral's verification system. While we strive for accuracy, always verify important information through multiple trusted sources.
          </p>
        </div>
      </div>
    </div>
  );
}