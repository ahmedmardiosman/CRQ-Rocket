import React, { useState, useEffect } from 'react';
import {
  AppState,
  CRQFormData,
  ProfessionalizedResult,
  UserIdentity,
  EmailDispatchResult,
  SAMPLE_TEMPLATES,
} from './types/crq';
import { Header } from './components/Header';
import { IdentityModal } from './components/IdentityModal';
import { CRQForm } from './components/CRQForm';
import { GeneratingState } from './components/GeneratingState';
import { ReviewSafetyGate } from './components/ReviewSafetyGate';
import { SentConfirmation } from './components/SentConfirmation';
import { generateCRQPdf } from './utils/pdfGenerator';
import { AlertCircle } from 'lucide-react';

const STORAGE_IDENTITY_KEY = 'crq_rocket_identity';
const STORAGE_DRAFT_KEY = 'crq_rocket_form_draft';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');

  // User Identity
  const [identity, setIdentity] = useState<UserIdentity>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_IDENTITY_KEY);
      if (saved) return JSON.parse(saved);
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      if (userName && userRole) {
        return { userName, userRole };
      }
    } catch (e) {
      console.warn('Failed to parse identity from localStorage:', e);
    }
    return { userName: '', userRole: '', userEmail: '' };
  });

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isFirstTimeIdentity, setIsFirstTimeIdentity] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<CRQFormData>(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (savedDraft) return JSON.parse(savedDraft);
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }
    return SAMPLE_TEMPLATES[0].data;
  });

  const [professionalized, setProfessionalized] = useState<ProfessionalizedResult | null>(null);
  const [dispatchResult, setDispatchResult] = useState<EmailDispatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Check identity on first load
  useEffect(() => {
    if (!identity.userName || !identity.userRole) {
      setIsFirstTimeIdentity(true);
      setIsIdentityModalOpen(true);
    }
  }, [identity.userName, identity.userRole]);

  // Persist form draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  }, [formData]);

  const handleSaveIdentity = (newIdentity: UserIdentity) => {
    setIdentity(newIdentity);
    try {
      localStorage.setItem(STORAGE_IDENTITY_KEY, JSON.stringify(newIdentity));
      localStorage.setItem('userName', newIdentity.userName);
      localStorage.setItem('userRole', newIdentity.userRole);
    } catch (e) {
      console.warn('Failed to save identity:', e);
    }
    setIsIdentityModalOpen(false);
    setIsFirstTimeIdentity(false);
  };

  const handleLoadTemplate = (templateData: CRQFormData) => {
    setFormData(templateData);
    setAppState('idle');
    setErrorMessage(null);
  };

  const handleSubmitForm = async () => {
    if (!identity.userName || !identity.userRole) {
      setIsIdentityModalOpen(true);
      return;
    }

    setAppState('generating');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/professionalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defectNumber: formData.defectNumber,
          title: formData.title,
          theFix: formData.theFix,
          testingDetails: formData.testingDetails,
          riskLevel: formData.riskLevel,
          releaseDate: formData.releaseDate,
          internalApprovers: formData.internalApprovers,
          userName: identity.userName,
          userRole: identity.userRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to process change request.`);
      }

      const data = await response.json();
      setProfessionalized(data);
      setAppState('preview');
    } catch (err: any) {
      console.error('Professionalize error:', err);
      setErrorMessage(
        err.message || 'An error occurred while communicating with the CAB AI server.'
      );
      setAppState('idle');
    }
  };

  const handleSendEmail = async (target: 'test' | 'all', overrideEmail?: string) => {
    if (!professionalized) return;
    setIsSending(true);
    setErrorMessage(null);

    try {
      let targetRecipients: string[] = [];
      if (target === 'test') {
        const testTarget = overrideEmail || identity.userEmail;
        if (!testTarget) {
          throw new Error('Please specify an email address to receive the test run.');
        }
        targetRecipients = [testTarget];
      } else {
        targetRecipients = formData.recipients
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
        if (targetRecipients.length === 0) {
          throw new Error('Please specify at least one recipient address.');
        }
      }

      const pdf = generateCRQPdf({
        defectNumber: formData.defectNumber,
        title: formData.title,
        theFix: formData.theFix,
        testingDetails: formData.testingDetails,
        releaseDate: formData.releaseDate,
        riskLevel: formData.riskLevel,
        internalApprovers: formData.internalApprovers,
        userName: identity.userName,
        userRole: identity.userRole,
        implementationSummary: professionalized.implementationSummary,
        validationSteps: professionalized.validationSteps,
        emailSubject: professionalized.emailSubject,
        emailBody: professionalized.emailBody,
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: targetRecipients,
          subject: professionalized.emailSubject,
          body: professionalized.emailBody,
          pdfBase64: pdf.base64,
          pdfFileName: pdf.fileName,
          senderName: `${identity.userName} (${identity.userRole})`,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Server rejected email dispatch.');
      }

      setDispatchResult({
        success: true,
        provider: result.provider || 'Client Dispatch',
        message: result.message || 'Email dispatched successfully.',
        recipients: targetRecipients,
        simulated: result.simulated,
      });

      setAppState('sent');
    } catch (err: any) {
      console.error('Dispatch error:', err);
      setErrorMessage(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!professionalized) return;
    const pdf = generateCRQPdf({
      defectNumber: formData.defectNumber,
      title: formData.title,
      theFix: formData.theFix,
      testingDetails: formData.testingDetails,
      releaseDate: formData.releaseDate,
      riskLevel: formData.riskLevel,
      internalApprovers: formData.internalApprovers,
      userName: identity.userName,
      userRole: identity.userRole,
      implementationSummary: professionalized.implementationSummary,
      validationSteps: professionalized.validationSteps,
      emailSubject: professionalized.emailSubject,
      emailBody: professionalized.emailBody,
    });
    pdf.download();
  };

  const handleResetToNewCRQ = () => {
    setAppState('idle');
    setProfessionalized(null);
    setDispatchResult(null);
    setErrorMessage(null);
  };

  const handleBackToReview = () => {
    setAppState('preview');
    setDispatchResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] flex flex-col font-sans">
      {/* Header */}
      <Header
        identity={identity}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onLoadTemplate={handleLoadTemplate}
        activeDefectNumber={formData.defectNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-[#fce8e6] border border-[#d93025] rounded-xl text-[#c5221f] text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#d93025]" />
            <div className="flex-1">
              <span className="font-bold">Error: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold px-2 py-1 bg-white border border-[#d93025] rounded hover:bg-[#fce8e6]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View state router */}
        {appState === 'idle' && (
          <CRQForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmitForm}
            isLoading={false}
            onLoadTemplate={handleLoadTemplate}
          />
        )}

        {appState === 'generating' && (
          <GeneratingState
            defectNumber={formData.defectNumber}
            title={formData.title}
          />
        )}

        {appState === 'preview' && professionalized && (
          <ReviewSafetyGate
            formData={formData}
            professionalized={professionalized}
            identity={identity}
            onBack={() => setAppState('idle')}
            onSendEmail={handleSendEmail}
            isSending={isSending}
          />
        )}

        {appState === 'sent' && dispatchResult && professionalized && (
          <SentConfirmation
            formData={formData}
            dispatchResult={dispatchResult}
            identity={identity}
            onNewCRQ={handleResetToNewCRQ}
            onBackToReview={handleBackToReview}
            onDownloadPdf={handleDownloadPdf}
            emailSubject={professionalized.emailSubject}
            emailBody={professionalized.emailBody}
            implementationSummary={professionalized.implementationSummary}
            validationSteps={professionalized.validationSteps}
          />
        )}
      </main>

      {/* Google Clean Footer */}
      <footer className="border-t border-[#dadce0] bg-white py-4 mt-12 text-xs text-[#5f6368]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] inline-block" />
            <span className="font-semibold text-[#202124]">CRQ-Rocket</span>
            <span>·</span>
            <span>Developer Change Request Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <span>ITIL CAB Compliance</span>
            <span>·</span>
            <span>Monochrome A4 PDF</span>
            <span>·</span>
            <span>Browser LocalStorage</span>
          </div>
        </div>
      </footer>

      {/* Identity Setup / Edit Modal */}
      <IdentityModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        identity={identity}
        onSave={handleSaveIdentity}
        isFirstTime={isFirstTimeIdentity}
      />
    </div>
  );
}
