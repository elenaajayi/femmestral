import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MisinfoDetectedScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:bg-white/10 rounded-full p-1">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">Message Verification</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            ⚠️ This message has been widely forwarded
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-2">
            Images and messages that spread quickly can sometimes contain misinformation.
          </p>
          <p className="text-center text-gray-700 font-medium mb-8">
            Would you like to verify this before sharing?
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/forward-to-agent')}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Check with Femstral
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-3 px-6 rounded-lg border border-gray-300 font-medium transition-colors"
            >
              <X className="w-5 h-5 inline mr-2" />
              Ignore
            </button>
          </div>

          {/* Info text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Checking helps protect your community from false information</p>
          </div>
        </div>
      </div>
    </div>
  );
}