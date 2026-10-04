import React, { useState, useMemo } from 'react';
import {
  CRQFormData,
  ProfessionalizedResult,
  UserIdentity,
} from '../types/crq';
import { generateCRQPdf } from '../utils/pdfGenerator';
import {
  FileText,
  Mail,
  Download,
  Send,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

interface ReviewSafetyGateProps {
  formData: CRQFormData;
  professionalized: ProfessionalizedResult;
  identity: UserIdentity;
  onBack: () => void;
  onSendEmail: (target: 'test' | 'all', overrideEmail?: string) => Promise<void>;
  isSending: boolean;
}

export const ReviewSafetyGate: React.FC<ReviewSafetyGateProps> = ({
  formData,
  professionalized,
  identity,
  onBack,
  onSendEmail,
  isSending,
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'email' | 'pdf'>('dossier');
  const [implementationSummary, setImplementationSummary] = useState(
    professionalized.implementationSummary || ''
  );
  const [validationSteps, setValidationSteps] = useState(
    professionalized.validationSteps || ''
  );
  const [emailSubject, setEmailSubject] = useState(
    professionalized.emailSubject || `[${formData.defectNumber}] CRQ: ${formData.title}`
  );
  const [emailBody, setEmailBody] = useState(
    professionalized.emailBody || ''
  );
  const [recipients, setRecipients] = useState(formData.recipients || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(identity.userEmail || '');

  const currentCRQData = useMemo(() => {
    return {
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
    };
  }, [
    formData,
    identity,
    implementationSummary,
    validationSteps,
    emailSubject,
    emailBody,
  ]);

  const pdfOutput = useMemo(() => {
    try {
      return generateCRQPdf(currentCRQData);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      return null;
    }
  }, [currentCRQData]);

  const placeholderCount = useMemo(() => {
    const text = `${implementationSummary} ${validationSteps} ${emailBody}`;
    const matches = text.match(/\[TECHNICAL DETAIL REQUIRED[^\]]*\]/gi);
    return matches ? matches.length : 0;
  }, [implementationSummary, validationSteps, emailBody]);

  const handleCopyEmail = () => {
    const fullText = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (pdfOutput) {
      pdfOutput.download();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Google Card */}
      <div className="google-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] font-medium text-xs rounded-full">
                Review & Safety Gate
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#202124]">
                Review Generated Request
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] mt-1">
              Verify accuracy. You have full edit access over the dossier, validation steps, and email before transmission.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onBack}
              className="google-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Notes</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="google-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer bg-[#f8f9fa]"
            >
              <Download className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Download PDF ({pdfOutput ? `${Math.round(pdfOutput.blob.size / 1024)} KB` : 'Ready'})</span>
            </button>
          </div>
        </div>

        {/* Warning if placeholders found */}
        {placeholderCount > 0 && (
          <div className="mt-4 p-3 bg-[#fef7e0] border border-[#f9ab00] rounded-lg text-[#b06000] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#f9ab00]" />
            <span>
              Found <strong className="underline">{placeholderCount} placeholder(s)</strong> (e.g. "[TECHNICAL DETAIL REQUIRED]"). You can replace them below before sending.
            </span>
          </div>
        )}
      </div>

      {/* Google Style Navigation Tabs */}
      <div className="flex border-b border-[#dadce0] gap-4">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`pb-3 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'dossier'
              ? 'border-[#1a73e8] text-[#1a73e8]'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>CAB Dossier Sections</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`pb-3 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'email'
              ? 'border-[#1a73e8] text-[#1a73e8]'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Stakeholder Email</span>
        </button>

        <button
          onClick={() => setActiveTab('pdf')}
          className={`pb-3 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'pdf'
              ? 'border-[#1a73e8] text-[#1a73e8]'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>A4 Document Preview</span>
        </button>
      </div>

      {/* TAB 1: CAB DOSSIER (PDF SECTIONS) */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="google-card p-5">
            <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-3">
              Dossier Metadata (Included in PDF)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
                <span className="text-[#5f6368] block text-[11px]">DEFECT / TICKET</span>
                <span className="font-bold text-[#202124] text-sm">{formData.defectNumber}</span>
              </div>
              <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
                <span className="text-[#5f6368] block text-[11px]">RISK LEVEL</span>
                <span className={`font-semibold ${formData.riskLevel === 'High' ? 'text-[#d93025]' : formData.riskLevel === 'Medium' ? 'text-[#b06000]' : 'text-[#137333]'}`}>
                  {formData.riskLevel} Risk
                </span>
              </div>
              <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
                <span className="text-[#5f6368] block text-[11px]">TARGET RELEASE</span>
                <span className="font-medium text-[#202124]">{formData.releaseDate}</span>
              </div>
              <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-lg">
                <span className="text-[#5f6368] block text-[11px]">SUBMITTER</span>
                <span className="font-medium text-[#202124]">{identity.userName}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Implementation Summary */}
          <div className="google-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-[#1a73e8]" />
                Section 1: Implementation Summary & Technical Specifications (Editable)
              </label>
              <span className="text-[11px] text-[#5f6368]">
                Preserves code/JSON blocks
              </span>
            </div>
            <textarea
              rows={9}
              value={implementationSummary}
              onChange={(e) => setImplementationSummary(e.target.value)}
              className="w-full google-input font-mono text-sm p-3.5 leading-relaxed bg-[#f8f9fa]"
            />
          </div>

          {/* Section 2: Validation Steps */}
          <div className="google-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-[#1a73e8]" />
                Section 2: Validation Steps & Quality Assurance (Editable)
              </label>
              <span className="text-[11px] text-[#5f6368]">
                Formal test verification
              </span>
            </div>
            <textarea
              rows={7}
              value={validationSteps}
              onChange={(e) => setValidationSteps(e.target.value)}
              className="w-full google-input font-mono text-sm p-3.5 leading-relaxed bg-[#f8f9fa]"
            />
          </div>
        </div>
      )}

      {/* TAB 2: STAKEHOLDER EMAIL */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="google-card p-6 space-y-5">
            
            {/* Recipients */}
            <div>
              <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
                To: Stakeholder Recipients (Editable)
              </label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full google-input px-3.5 py-2.5 font-mono text-sm"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
                Subject: (Editable)
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full google-input px-3.5 py-2.5 font-medium text-sm"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#3c4043] uppercase tracking-wider">
                  Email Body (Editable)
                </label>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="google-btn-secondary px-2.5 py-1 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#1e8e3e]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                </button>
              </div>
              <textarea
                rows={14}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full google-input font-mono text-sm p-3.5 leading-relaxed bg-[#f8f9fa]"
              />
            </div>

            {/* Attachment note */}
            <div className="p-3 bg-[#e8f0fe] rounded-lg border border-[#d2e3fc] flex items-center justify-between text-xs text-[#1a73e8]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1a73e8]" />
                <span className="text-[#174ea6]">
                  Attachment: <strong>{pdfOutput?.fileName || 'CRQ-Report.pdf'}</strong> (A4 Monochrome Dossier generated in-memory)
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="text-[#1a73e8] hover:underline font-semibold"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: A4 DOCUMENT PREVIEW */}
      {activeTab === 'pdf' && (
        <div className="google-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f1f3f4] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] font-medium text-[11px] rounded-full">
                  CAB Monochrome A4
                </span>
                <h3 className="text-sm font-bold text-[#202124]">
                  Change Request Dossier Document
                </h3>
              </div>
              <p className="text-xs text-[#5f6368] mt-0.5">
                Exact representation of the generated PDF report.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="google-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF File</span>
              </button>
            </div>
          </div>

          {/* Authentic A4 Document Sheet View */}
          <div className="w-full bg-[#f1f3f4] rounded-xl p-4 sm:p-8 flex justify-center overflow-x-auto border border-[#dadce0]">
            <div className="w-full max-w-[800px] bg-white text-black p-8 sm:p-12 shadow-md border border-neutral-300 font-sans leading-normal">
              
              {/* Top Black Bar */}
              <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between text-[11px] font-bold tracking-wider mb-6">
                <span>CHANGE ADVISORY BOARD (CAB) FORMAL RELEASE DOSSIER</span>
                <span className="text-[9px] tracking-widest text-neutral-300">CLASSIFICATION: RESTRICTED</span>
              </div>

              {/* Document Header */}
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight uppercase font-sans">
                  CRQ Report: {formData.defectNumber || 'DEF-UNASSIGNED'} - {formData.title || 'Untitled Change Request'}
                </h1>
                <div className="text-[11px] text-neutral-600 font-mono mt-1 pb-2 border-b-2 border-black flex flex-wrap justify-between gap-1">
                  <span>Document Reference: CRQ-{formData.defectNumber || 'DEF'}</span>
                  <span>Generated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
                </div>
              </div>

              {/* 2-Column Summary Table */}
              <div className="mb-6">
                <table className="w-full text-xs border border-black border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black">
                      <th className="text-left p-2 font-bold w-1/3 border-r border-black uppercase text-[10px] tracking-wider">
                        METRIC / ATTRIBUTE
                      </th>
                      <th className="text-left p-2 font-bold uppercase text-[10px] tracking-wider">
                        SPECIFICATION DETAILS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Creator / Submitter</td>
                      <td className="p-2 font-medium">{identity.userName || 'Engineering Submitter'}</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Submitter Role</td>
                      <td className="p-2 font-medium">{identity.userRole || 'Software Engineer'}</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Defect / Ticket #</td>
                      <td className="p-2 font-bold font-mono">{formData.defectNumber || 'DEF-UNASSIGNED'}</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Target Release Date</td>
                      <td className="p-2 font-medium">{formData.releaseDate || 'Immediate Scheduled Window'}</td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Assessed Risk Level</td>
                      <td className="p-2 font-bold">
                        <span className={`px-1.5 py-0.5 border text-[11px] ${formData.riskLevel === 'High' ? 'bg-red-50 border-red-500 text-red-800' : formData.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-green-50 border-green-500 text-green-800'}`}>
                          {formData.riskLevel.toUpperCase()} RISK
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-300">
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Internal Approvers</td>
                      <td className="p-2 font-medium">{formData.internalApprovers || 'Peer Review Verified / CI Pipeline Passed'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-neutral-50 border-r border-black">Authorization Status</td>
                      <td className="p-2 font-bold text-neutral-800">PENDING CAB STAKEHOLDER APPROVAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 1: Implementation Summary */}
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-black pb-1 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                    1. Implementation Summary & Technical Specifications
                  </h2>
                </div>
                <div className="text-xs text-neutral-900 whitespace-pre-wrap leading-relaxed space-y-3 font-sans">
                  {implementationSummary.split('\n\n').map((paragraph, idx) => {
                    const isCode = paragraph.includes('```') || paragraph.includes('{\n') || paragraph.startsWith('{');
                    if (isCode) {
                      const clean = paragraph.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
                      return (
                        <pre key={idx} className="bg-neutral-100 p-3 border border-neutral-300 font-mono text-[11px] overflow-x-auto text-neutral-900 rounded-none">
                          <code>{clean}</code>
                        </pre>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>
              </div>

              {/* Section 2: Validation Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-black pb-1 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                    2. Validation Steps & Quality Assurance
                  </h2>
                </div>
                <div className="text-xs text-neutral-900 whitespace-pre-wrap leading-relaxed space-y-3 font-sans">
                  {validationSteps.split('\n\n').map((paragraph, idx) => {
                    const isCode = paragraph.includes('```');
                    if (isCode) {
                      const clean = paragraph.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
                      return (
                        <pre key={idx} className="bg-neutral-100 p-3 border border-neutral-300 font-mono text-[11px] overflow-x-auto text-neutral-900">
                          <code>{clean}</code>
                        </pre>
                      );
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>
              </div>

              {/* Section 3: Rollback Procedures */}
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-black pb-1 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                    3. Rollback Procedure & Environmental Safeguards
                  </h2>
                </div>
                <p className="text-xs text-neutral-900 leading-relaxed font-sans">
                  In accordance with enterprise deployment policy, this release retains an automated rollback capability. Should any unexpected metric deviation, latency anomaly, or error spike trigger telemetry alarms during the canary phase, the pipeline will immediately restore the preceding verified release artifact. Mean Time to Recovery (MTTR) under standard rollback conditions is estimated at under 180 seconds.
                </p>
              </div>

              {/* Sign-Off Signature Box */}
              <div className="border-t border-neutral-400 pt-6 mt-6 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="border-b border-black w-48 h-8 mb-1.5" />
                  <div className="font-bold text-black">Lead Submitter: {identity.userName || 'Engineer'}</div>
                  <div className="text-neutral-600">Title: {identity.userRole || 'Engineering Lead'}</div>
                </div>
                <div>
                  <div className="border-b border-black w-48 h-8 mb-1.5" />
                  <div className="font-bold text-black">CAB Reviewer Sign-off: _________________</div>
                  <div className="text-neutral-600">Approval Date: _________________________</div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-300 pt-4 mt-8 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>CRQ-Rocket Dossier | {formData.defectNumber || 'DEF'} | Confidential - CAB Review Only</span>
                <span>Page 1 of 1</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ACTION BAR: "Send Test to Me" & "Send to All Stakeholders" */}
      <div className="google-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
              Ready for Authorization
            </div>
            <div className="text-sm text-[#202124]">
              Signed by: <strong className="font-semibold">{identity.userName}</strong> ({identity.userRole})
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Send Test to Me button */}
            <button
              type="button"
              disabled={isSending}
              onClick={() => {
                if (!identity.userEmail) {
                  setShowTestPrompt(true);
                } else {
                  onSendEmail('test', identity.userEmail);
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 google-btn-secondary flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Mail className="w-4 h-4 text-[#1a73e8]" />
              <span>Send Test to Me</span>
            </button>

            {/* Send to All Stakeholders button */}
            <button
              type="button"
              disabled={isSending}
              onClick={() => onSendEmail('all')}
              className="flex-1 sm:flex-initial px-6 py-2.5 google-btn-primary flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending...' : 'Send to All Stakeholders'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Email Prompt Modal */}
      {showTestPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#dadce0] p-6 text-[#202124]">
            <h3 className="text-base font-bold text-[#202124] mb-1">
              Send Test CAB Package
            </h3>
            <p className="text-xs text-[#5f6368] mb-4">
              Enter your email address to receive a test copy of the CAB email and generated PDF attachment.
            </p>

            <input
              type="email"
              placeholder="e.g. ahmedmardiosman@gmail.com"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowTestPrompt(false)}
                className="google-btn-secondary px-3.5 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!testEmailInput.trim()) return;
                  setShowTestPrompt(false);
                  onSendEmail('test', testEmailInput.trim());
                }}
                className="google-btn-primary px-4 py-2 text-xs"
              >
                Send Test Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
