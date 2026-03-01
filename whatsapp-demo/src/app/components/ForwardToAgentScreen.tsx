import { Lock, Search, Scale, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function ForwardToAgentScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/misinfo-detected')} className="hover:bg-white/10 rounded-full p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">Forward to Femstral</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          {/* Bot Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="4" y="8" width="16" height="12" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="13" r="1" fill="currentColor"/>
                <circle cx="15" cy="13" r="1" fill="currentColor"/>
                <path d="M9 16c.5.7 1.5 1 3 1s2.5-.3 3-1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Send to Femstral for verification
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-3">
            Femstral will analyze this image and check reliable sources to verify whether it is accurate.
          </p>
          <p className="text-center text-gray-700 font-medium mb-8">
            Your message will not be shared publicly.
          </p>

          {/* Trust Badges */}
          <div className="bg-white rounded-lg p-4 mb-8 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Private</div>
                  <div className="text-sm text-gray-500">End-to-end encrypted</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Fact-checked</div>
                  <div className="text-sm text-gray-500">Cross-referenced with credible sources</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Neutral</div>
                  <div className="text-sm text-gray-500">Unbiased and objective analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Forward Button */}
          <button
            onClick={() => navigate('/agent-chat')}
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-md"
          >
            Forward to Femstral
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Cancel */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}