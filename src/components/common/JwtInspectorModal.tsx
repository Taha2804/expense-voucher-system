import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  X,
  RefreshCw,
  Terminal,
  Clock,
  User,
  AlertCircle,
  FileCode,
} from 'lucide-react';

interface JwtInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JwtInspectorModal: React.FC<JwtInspectorModalProps> = ({ isOpen, onClose }) => {
  const { jwtToken, decodedJwt, isTokenValid, verifyCurrentToken, currentUser } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid?: boolean; error?: string; timestamp?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (!jwtToken) return;
    navigator.clipboard.writeText(jwtToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyCurl = () => {
    if (!jwtToken) return;
    const curl = `curl -X GET "http://localhost:3000/api/auth/me" \\\n  -H "Authorization: Bearer ${jwtToken}" \\\n  -H "Content-Type: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyCurrentToken();
      setVerifyResult({
        valid: res.valid,
        error: res.error,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setVerifyResult({
        valid: false,
        error: err.message || 'Verification failed',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const expirationDate = decodedJwt?.exp
    ? new Date(decodedJwt.exp * 1000).toLocaleString()
    : 'Unknown';

  const issuedDate = decodedJwt?.iat
    ? new Date(decodedJwt.iat * 1000).toLocaleString()
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">JWT Authentication Diagnostics & Token Inspector</h2>
              <p className="text-[11px] text-neutral-500">RFC 7519 HMAC-SHA256 (HS256) bearer token state & claims</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isTokenValid ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span className="font-semibold text-neutral-800">
                Status: {isTokenValid ? 'Active Valid JWT Token' : 'Expired / Missing Token'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
              <span>Alg: HS256</span>
              <span>·</span>
              <span>Role: <strong className="text-neutral-900 uppercase">{currentUser?.role}</strong></span>
            </div>
          </div>

          {/* Raw Encoded JWT Token Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                Raw Encoded Bearer Token (<code className="font-mono text-neutral-800">eyJ...</code>)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCurl}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Terminal className="w-3 h-3" />}
                  <span>{copiedCurl ? 'Copied cURL!' : 'Copy cURL Request'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedToken ? 'Copied Token!' : 'Copy Raw JWT'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 text-neutral-200 font-mono text-[11px] rounded-lg break-all border border-neutral-800 select-all max-h-24 overflow-y-auto">
              {jwtToken || 'No JWT token available'}
            </div>
          </div>

          {/* Decoded Claims Payload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Header Claims */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Decoded Token Header
              </span>
              <pre className="font-mono text-[11px] text-neutral-800 bg-white p-2 rounded border border-neutral-200">
{JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)}
              </pre>
            </div>

            {/* Timestamps */}
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Lifecycle & Issuer
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Issued At (iat):</span>
                  <span className="font-mono text-neutral-800">{issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Expires At (exp):</span>
                  <span className="font-mono text-neutral-800">{expirationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Issuer (iss):</span>
                  <span className="text-neutral-700 truncate max-w-[130px]">ABC Company Auth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payload Claims */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 block">
              Decoded Claims Payload (RBAC Claims)
            </span>
            <pre className="p-3 bg-neutral-50 font-mono text-[11px] text-neutral-800 rounded-lg border border-neutral-200 overflow-x-auto">
{decodedJwt ? JSON.stringify(decodedJwt, null, 2) : '// No decoded claims available'}
            </pre>
          </div>

          {/* Server Validation Test */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Verify Signature on Backend (/api/auth/verify)</span>
            </button>

            {verifyResult && (
              <span className={`font-semibold ${verifyResult.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                {verifyResult.valid ? `✔ Signature Validated (${verifyResult.timestamp})` : `✖ ${verifyResult.error}`}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
