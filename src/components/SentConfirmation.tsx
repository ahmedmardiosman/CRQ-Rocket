import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Mail,
  RotateCcw,
  ExternalLink,
  ArrowLeft,
  Users,
  Paperclip,
  Check,
} from 'lucide-react';
import { CRQFormData, EmailDispatchResult, UserIdentity } from '../types/crq';
import { generateCRQPdf } from '../utils/pdfGenerator';

interface SentConfirmationProps {
  formData: CRQFormData;
  dispatchResult: EmailDispatchResult;
  identity: UserIdentity;
  onNewCRQ: () => void;
  onBackToReview: () => void;
  onDownloadPdf: () => void;
  emailSubject: string;
  emailBody: string;
  implementationSummary: string;
  validationSteps: string;
}

export const SentConfirmation: React.FC<SentConfirmationProps> = ({
  formData,
  dispatchResult,
  identity,
  onNewCRQ,
  onBackToReview,
  onDownloadPdf,
  emailSubject,
  emailBody,
  implementationSummary,
  validationSteps,
}) => {
  const [emailOpened, setEmailOpened] = useState(false);

  const recipientString = dispatchResult.recipients.join(',');
  const mailtoLink = `mailto:${encodeURIComponent(recipientString)}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientString
  )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Handler: opens the email client AND downloads the PDF
  const handleOpenEmail = async () => {
    setEmailOpened(true);

    const pdfResult = generateCRQPdf({
      defectNumber: formData.defectNumber,
      title: formData.title,
      theFix: formData.theFix,
      testingDetails: formData.testingDetails,
      releaseDate: formData.releaseDate,
      riskLevel: formData.riskLevel,
      internalApprovers: formData.internalApprovers,
      userName: identity.userName,
      userRole: identity.userRole,
      implementationSummary,
      validationSteps,
      emailSubject,
      emailBody,
    });

    // 1. Download PDF so it is immediately available on disk
    pdfResult.download();

    // 2. Try native system share with attached file if supported
    const pdfFile = new File([pdfResult.blob], pdfResult.fileName, { type: 'application/pdf' });
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: emailSubject,
          text: emailBody,
          files: [pdfFile],
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 3. Launch default email client directly
    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 250);
  };

  const handleOpenGmail = () => {
    setEmailOpened(true);
    onDownloadPdf();
    window.open(gmailComposeUrl, '_blank');
  };

  return (
    <div className="google-card p-6 sm:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f1f3f4] pb-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-[#e6f4ea] rounded-full flex items-center justify-center text-[#1e8e3e] shrink-0 border border-[#ceead6]">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="inline-block bg-[#e8f0fe] text-[#1a73e8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-1">
              CRQ Ready & Packaged
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202124]">
              Change Request Generated Successfully
            </h2>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Stakeholder package compiled with monochrome CAB PDF dossier and email text.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToReview}
          className="google-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Back to Review Screen</span>
        </button>
      </div>

      {/* 2. Focused Action Card */}
      <div className="p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-xs text-[#202124] space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="font-bold text-sm text-[#202124]">
              Send Email with Attached PDF
            </h3>
          </div>
          <span className="text-[11px] text-[#1e8e3e] bg-[#e6f4ea] font-medium px-2 py-0.5 rounded-full border border-[#ceead6] flex items-center gap-1">
            <Check className="w-3 h-3" />
            Ready to Send
          </span>
        </div>

        <p className="text-[#5f6368] text-xs leading-relaxed">
          Click <strong>Open in Email Client</strong> below to launch your email client with the subject, recipients, and message pre-filled. The <strong>{formData.defectNumber || 'CRQ'}-Report.pdf</strong> dossier is downloaded simultaneously so you can attach it to the email.
        </p>

        {emailOpened && (
          <div className="p-3 bg-[#e6f4ea] border border-[#ceead6] rounded-lg text-[#137333] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#1e8e3e]" />
            <span>
              Email client opened and <strong>{formData.defectNumber || 'CRQ'}-Report.pdf</strong> downloaded to your computer! Attach the PDF and click Send.
            </span>
          </div>
        )}

        {/* Action Buttons inside Card */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleOpenEmail}
            className="google-btn-primary px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Mail className="w-4 h-4" />
            <span>Open in Email Client</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenGmail}
            className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer text-[#d93025] hover:bg-[#fce8e6] border-[#dadce0]"
          >
            <Mail className="w-4 h-4 text-[#d93025]" />
            <span>Open in Gmail Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#d93025]" />
          </button>

          <button
            onClick={onDownloadPdf}
            className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1a73e8]" />
            <span>Download PDF Only</span>
          </button>
        </div>
      </div>

      {/* 3. Delivery Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
          <span className="text-[#5f6368] block text-[10px] uppercase font-semibold">DEFECT ID</span>
          <span className="font-bold text-[#1a73e8] text-sm">{formData.defectNumber}</span>
        </div>

        <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
          <span className="text-[#5f6368] block text-[10px] uppercase font-semibold">ATTACHMENT</span>
          <span className="font-semibold text-[#202124] text-sm">Monochrome A4 PDF</span>
        </div>

        <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
          <span className="text-[#5f6368] block text-[10px] uppercase font-semibold">RECIPIENTS COUNT</span>
          <span className="font-semibold text-[#202124] text-sm">
            {dispatchResult.recipients.length} Recipient(s)
          </span>
        </div>

        <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
          <span className="text-[#5f6368] block text-[10px] uppercase font-semibold">STATUS</span>
          <span className="font-bold text-[#1e8e3e] text-sm">READY TO SEND</span>
        </div>
      </div>

      {/* 4. Recipient breakdown */}
      <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-[#202124] font-semibold text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Target Recipient Manifest:</span>
          </div>

          <button
            onClick={onBackToReview}
            className="google-btn-secondary px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer text-[#1a73e8] hover:bg-[#e8f0fe]"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Go Back to Send to Other Recipients</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {dispatchResult.recipients.map((email) => (
            <span
              key={email}
              className="px-2.5 py-1 bg-white border border-[#dadce0] rounded text-[#3c4043] font-mono text-xs"
            >
              {email}
            </span>
          ))}
        </div>

        <div className="pt-2 border-t border-[#e8eaed] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[11px] text-[#5f6368]">
            Full configured stakeholder distribution: <strong className="text-[#202124] font-mono">{formData.recipients || 'None'}</strong>
          </span>
          <button
            onClick={onBackToReview}
            className="google-btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Send to All Stakeholders</span>
          </button>
        </div>
      </div>

      {/* 5. Bottom Navigation Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          onClick={handleOpenEmail}
          className="google-btn-primary px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Mail className="w-4 h-4" />
          <span>Open in Email Client</span>
        </button>

        <button
          onClick={handleOpenGmail}
          className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer text-[#d93025] hover:bg-[#fce8e6] border-[#dadce0]"
        >
          <Mail className="w-4 h-4 text-[#d93025]" />
          <span>Open in Gmail Web</span>
        </button>

        <button
          onClick={onBackToReview}
          className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer text-[#1a73e8] hover:bg-[#e8f0fe]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Screen</span>
        </button>

        <button
          onClick={onDownloadPdf}
          className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#1a73e8]" />
          <span>Download CAB PDF Dossier</span>
        </button>

        <button
          onClick={onNewCRQ}
          className="google-btn-secondary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#5f6368]" />
          <span>Create Another CRQ</span>
        </button>
      </div>
    </div>
  );
};
