import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Search,
  Loader2,
  Ban,
  Sparkles
} from 'lucide-react';
import type { CertificateVerificationResult } from '../../types/certificate';
import { certificateService } from '../../services/certificateService';
import { CertificateCanvas } from '../../components/certificate/CertificateCanvas';

export const VerifyCertificate: React.FC = () => {
  const { certificateNumber: paramCertNumber } = useParams<{ certificateNumber?: string }>();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(paramCertNumber || '');
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleVerify = async (certNumToVerify: string) => {
    const cleanNum = certNumToVerify.trim();
    if (!cleanNum) return;

    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.verifyCertificate(cleanNum);
      setResult(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult(null);
        setError('No verified credential record found with this ID in the Oxyfied official registry.');
      } else {
        setError('Verification service temporarily unavailable. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertNumber) {
      setSearchInput(paramCertNumber);
      handleVerify(paramCertNumber);
    }
  }, [paramCertNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify-certificate/${encodeURIComponent(searchInput.trim())}`);
      handleVerify(searchInput.trim());
    }
  };

  const handleCopyVerificationUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPdf = async () => {
    if (!result?.certificateNumber) return;
    try {
      setIsDownloading(true);
      await certificateService.downloadPdf(
        result.certificateNumber,
        `Oxyfied-Verified-Certificate-${result.certificateNumber}.pdf`
      );
    } catch (err) {
      alert('Failed to download PDF credential. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 antialiased font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Subtle ambient background glow accents matching Dashboard */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 -ml-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-left relative z-10">
        {/* Verification Headline & Subtitle */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Official Certificate Authenticator
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-stone-900 tracking-tight">
            Credential Verification
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Verify the authenticity, issuance metadata, and completion status of official credentials awarded by the Oxyfied Academy of Advanced Computing.
          </p>
        </div>

        {/* Search / Verification Card */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all max-w-2xl mx-auto space-y-4">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-stone-900">
              Verify a Credential
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter the unique Certificate ID to lookup official registry records.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-1">
            <div className="relative flex items-center bg-stone-50/80 border border-stone-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g. OXY-2026-894120)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-36 sm:pr-40 py-3 bg-transparent text-sm font-mono text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !searchInput.trim()}
                className="absolute right-1.5 px-4 sm:px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Credential</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>Format: <code className="font-mono text-stone-600 font-semibold">OXY-YYYY-XXXXXX</code></span>
              <span className="hidden sm:inline-flex items-center gap-1 text-stone-500">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Instant cryptographic ledger validation
              </span>
            </div>
          </form>
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="bg-white border border-stone-200/80 p-12 rounded-3xl text-center space-y-3 shadow-sm max-w-md mx-auto animate-in fade-in duration-200">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
            <h3 className="font-display font-bold text-stone-900 text-base">Validating Credential...</h3>
            <p className="text-xs text-stone-500">Querying cryptographic credential ledger records...</p>
          </div>
        )}

        {/* Error / Not Found Message */}
        {error && !loading && (
          <div className="bg-white border border-rose-200 p-8 sm:p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-sm animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-stone-900">Credential Record Not Found</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{error}</p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-500 leading-relaxed text-left space-y-1">
              <strong className="text-stone-700 block">Verification Tips:</strong>
              <div>• Please double check the Certificate ID format (e.g., <code className="font-mono font-semibold text-stone-800">OXY-2026-XXXXXX</code>).</div>
              <div>• Ensure no trailing spaces were accidentally copied.</div>
              <div>• For freshly approved credentials, verify with the issuing mentor or admin.</div>
            </div>
          </div>
        )}

        {/* Verification Result Card */}
        {result && !loading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Status Hero Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-white ${
                result.status === 'revoked'
                  ? 'border-rose-200'
                  : 'border-stone-200/80'
              }`}
            >
              {/* Subtle ambient accent */}
              <div
                className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
                  result.status === 'revoked' ? 'bg-rose-500/5' : 'bg-emerald-500/5'
                }`}
              />

              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border ${
                    result.status === 'revoked'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                >
                  {result.status === 'revoked' ? (
                    <Ban className="w-7 h-7" />
                  ) : (
                    <ShieldCheck className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        result.status === 'revoked'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : result.status === 'reissued'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {result.status === 'revoked' ? (
                        <Ban className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Status: {result.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-500 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-stone-900">
                    {result.status === 'revoked'
                      ? 'Credential Has Been Revoked'
                      : 'Authentic & Verified Oxyfied Credential'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Awarded by <strong className="text-stone-800">{result.organizationName || 'Oxyfied Academy'}</strong> to{' '}
                    <strong className="text-stone-900">{result.studentName}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                <button
                  onClick={handleCopyVerificationUrl}
                  className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                  <span>{copied ? 'Link Copied' : 'Share Verification Link'}</span>
                </button>

                {result.status !== 'revoked' && (
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Metadata Specs */}
              <div className="bg-white border border-stone-200/80 p-6 sm:p-7 rounded-3xl space-y-6 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-display font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-blue-600" />
                    Certificate Details
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                    Verified Record
                  </span>
                </div>

                <div className="space-y-4 text-xs divide-y divide-stone-100">
                  <div className="space-y-1">
                    <span className="text-stone-400 text-[11px] font-medium uppercase tracking-wider block">Student</span>
                    <span className="font-bold text-stone-900 text-base block">{result.studentName}</span>
                  </div>

                  <div className="space-y-1 pt-3">
                    <span className="text-stone-400 text-[11px] font-medium uppercase tracking-wider block">Program</span>
                    <span className="font-bold text-stone-900 text-sm block leading-snug">
                      {result.courseTitle}
                    </span>
                  </div>

                  <div className="space-y-1 pt-3">
                    <span className="text-stone-400 text-[11px] font-medium uppercase tracking-wider block">Certificate Number</span>
                    <span className="font-mono font-bold text-stone-900 text-xs block">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wider block">Issued On</span>
                      <span className="font-mono text-stone-800 text-xs font-semibold">
                        {new Date(result.issueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wider block">Completed On</span>
                      <span className="font-mono text-stone-800 text-xs font-semibold">
                        {new Date(result.completionDate || result.issueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-1">
                    <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wider block">Lead Technical Mentor</span>
                    <span className="text-stone-800 text-xs font-semibold block">{result.mentorName}</span>
                  </div>

                  <div className="pt-3 space-y-1">
                    <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wider block">Issuing Authority</span>
                    <span className="text-stone-800 text-xs font-medium block">
                      {result.organizationName || 'Oxyfied Academy of Advanced Computing'}
                    </span>
                  </div>

                  <div className="pt-3 space-y-1">
                    <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wider block">Verification Timestamp</span>
                    <span className="text-stone-500 text-[11px] font-mono block">
                      {new Date(result.verifiedAt).toUTCString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Certificate Preview Render */}
              <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col justify-between overflow-hidden space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-display font-bold text-sm text-stone-900">
                      Official Certificate Document
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200 px-2.5 py-0.5 rounded-md">
                    High-Resolution Vector Preview
                  </span>
                </div>

                <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden min-h-[380px] shadow-inner">
                  <div className="w-full flex items-center justify-center overflow-auto py-2">
                    <CertificateCanvas
                      orientation={result.templateSnapshot?.orientation || 'landscape'}
                      backgroundImage={result.templateSnapshot?.backgroundImage || null}
                      elements={result.templateSnapshot?.elements || []}
                      sampleData={{
                        studentName: result.studentName,
                        courseTitle: result.courseTitle,
                        certificateNumber: result.certificateNumber,
                        issueDate: new Date(result.issueDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }),
                        completionDate: new Date(result.completionDate || result.issueDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }),
                        duration: result.duration || 'Comprehensive Program',
                        mentorName: result.mentorName,
                        organizationName: 'Oxyfied Official Credential Authority'
                      }}
                      isEditable={false}
                      zoom={0.55}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Digital watermark & dynamic cryptographic QR embedded</span>
                  <span className="font-mono text-stone-500">Status: Verified Authenticity</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
