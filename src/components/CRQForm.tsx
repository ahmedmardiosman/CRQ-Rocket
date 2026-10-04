import React, { useState } from 'react';
import {
  CRQFormData,
  RiskLevel,
  SAMPLE_TEMPLATES,
} from '../types/crq';
import {
  Rocket,
  Code,
  FileCheck,
  Calendar,
  AlertTriangle,
  Users,
  AtSign,
  Tag,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';

interface CRQFormProps {
  formData: CRQFormData;
  onChange: (data: CRQFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onLoadTemplate: (template: CRQFormData) => void;
}

export const CRQForm: React.FC<CRQFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onLoadTemplate,
}) => {
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const updateField = <K extends keyof CRQFormData>(field: K, value: CRQFormData[K]) => {
    onChange({
      ...formData,
      [field]: value,
    });
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.defectNumber.trim()) {
      errors.defectNumber = 'Defect / Ticket # is required (e.g. DEF-702)';
    }
    if (!formData.title.trim()) {
      errors.title = 'CRQ Title is required';
    }
    if (!formData.theFix.trim()) {
      errors.theFix = 'The Fix notes or code snippet is required';
    }
    if (!formData.testingDetails.trim()) {
      errors.testingDetails = 'Testing & validation details are required';
    }
    if (!formData.recipients.trim()) {
      errors.recipients = 'At least one recipient email address is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onSubmit();
  };

  const handleClear = () => {
    if (window.confirm('Clear all form fields and start fresh?')) {
      onChange({
        recipients: '',
        defectNumber: '',
        title: '',
        theFix: '',
        testingDetails: '',
        releaseDate: new Date().toISOString().split('T')[0],
        riskLevel: 'Low',
        internalApprovers: '',
      });
      setFormErrors({});
    }
  };

  return (
    <form onSubmit={handleValidateAndSubmit} className="space-y-6">
      {/* Top Banner: Google styled card with quick presets */}
      <div className="google-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f1f3f4] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e]" />
              <h2 className="text-base sm:text-lg font-bold text-[#202124]">
                Technical Change Request Input
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Enter raw developer notes, JSON configs, or test results. The AI will translate them into executive CAB documentation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="google-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Fill Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#5f6368] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#f9ab00]" /> Quick Fill:
          </span>
          {SAMPLE_TEMPLATES.map((tpl) => (
            <button
              type="button"
              key={tpl.id}
              onClick={() => onLoadTemplate(tpl.data)}
              className="text-xs font-medium px-3 py-1 bg-[#f8f9fa] hover:bg-[#e8f0fe] hover:text-[#1a73e8] border border-[#dadce0] rounded-full text-[#3c4043] transition-colors cursor-pointer"
            >
              {tpl.data.defectNumber} ({tpl.data.riskLevel})
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields Container: Google Box Style */}
      <div className="google-card p-6 sm:p-8 space-y-6">
        
        {/* ROW 1: Defect #, Title, Risk Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Field 2: Defect # */}
          <div id="field-defectNumber">
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#1a73e8]" />
                2. Defect # *
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. DEF-702"
              value={formData.defectNumber}
              onChange={(e) => updateField('defectNumber', e.target.value)}
              className={`w-full google-input px-3.5 py-2.5 font-mono text-sm ${
                formErrors.defectNumber ? 'border-[#d93025] ring-1 ring-[#d93025]' : ''
              }`}
            />
            {formErrors.defectNumber && (
              <p className="text-xs text-[#d93025] mt-1">{formErrors.defectNumber}</p>
            )}
          </div>

          {/* Field 3: CRQ Title */}
          <div id="field-title" className="sm:col-span-1 lg:col-span-2">
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-[#1a73e8]" />
                3. CRQ Title *
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Auth Token Expiry Fix & Silent Refresh Window"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`w-full google-input px-3.5 py-2.5 text-sm ${
                formErrors.title ? 'border-[#d93025] ring-1 ring-[#d93025]' : ''
              }`}
            />
            {formErrors.title && (
              <p className="text-xs text-[#d93025] mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Field 7: Risk Level */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f9ab00]" />
                7. Risk Level *
              </span>
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => updateField('riskLevel', e.target.value as RiskLevel)}
              className="w-full google-input px-3.5 py-2.5 text-sm font-medium cursor-pointer"
            >
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Release Date & Internal Approvers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Field 6: Release Date */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1a73e8]" />
                6. Target Release Date *
              </span>
            </label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) => updateField('releaseDate', e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm cursor-pointer"
            />
          </div>

          {/* Field 8: Internal Approvers */}
          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1a73e8]" />
                8. Internal Approvers *
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Chen (Staff Security), Marcus Vance (Lead)"
              value={formData.internalApprovers}
              onChange={(e) => updateField('internalApprovers', e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Field 1: Recipients */}
        <div id="field-recipients">
          <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#1a73e8]" />
              1. Stakeholder Recipients (Comma-separated emails) *
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="cab-approvals@company.io, release-management@corp.net, dev-leads@company.io"
            value={formData.recipients}
            onChange={(e) => updateField('recipients', e.target.value)}
            className={`w-full google-input px-3.5 py-2.5 font-mono text-sm ${
              formErrors.recipients ? 'border-[#d93025] ring-1 ring-[#d93025]' : ''
            }`}
          />
          {formErrors.recipients ? (
            <p className="text-xs text-[#d93025] mt-1">{formErrors.recipients}</p>
          ) : (
            <p className="text-xs text-[#5f6368] mt-1">
              Separate multiple email addresses with commas.
            </p>
          )}
        </div>

        {/* Field 4: The Fix */}
        <div id="field-theFix">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#3c4043] uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#1a73e8]" />
              4. The Fix (Raw Notes, Code Snippets, or JSON) *
            </label>
            <span className="text-[11px] text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">
              Preserves Code & JSON
            </span>
          </div>
          <textarea
            rows={6}
            placeholder={`Paste your raw implementation notes, git diff summaries, or JSON configurations here:
e.g.
Fixed 401 loop on token expiry by adding 30s leeway.
Updated schema:
{
  "token_id": "rt_981248012f",
  "leeway_seconds": 30
}`}
            value={formData.theFix}
            onChange={(e) => updateField('theFix', e.target.value)}
            className={`w-full google-input font-mono text-sm p-3.5 leading-relaxed bg-[#f8f9fa] ${
              formErrors.theFix ? 'border-[#d93025] ring-1 ring-[#d93025]' : ''
            }`}
          />
          {formErrors.theFix && (
            <p className="text-xs text-[#d93025] mt-1">{formErrors.theFix}</p>
          )}
        </div>

        {/* Field 5: Testing Details */}
        <div id="field-testingDetails">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#3c4043] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
              5. Testing Details (Validation Procedures & Results) *
            </label>
            <span className="text-[11px] text-[#5f6368]">
              Regression & staging verification
            </span>
          </div>
          <textarea
            rows={5}
            placeholder={`Describe how this change was validated:
e.g.
1. Ran npm run test:auth (42 passing unit/integration tests).
2. Simulated clock skew (+/- 45s) on staging cluster auth nodes.
3. Zero infinite redirect loops across 5,000 synthetic mobile client requests.`}
            value={formData.testingDetails}
            onChange={(e) => updateField('testingDetails', e.target.value)}
            className={`w-full google-input font-mono text-sm p-3.5 leading-relaxed bg-[#f8f9fa] ${
              formErrors.testingDetails ? 'border-[#d93025] ring-1 ring-[#d93025]' : ''
            }`}
          />
          {formErrors.testingDetails && (
            <p className="text-xs text-[#d93025] mt-1">{formErrors.testingDetails}</p>
          )}
        </div>

        {/* Info card */}
        <div className="p-3.5 bg-[#e8f0fe] rounded-lg border border-[#d2e3fc] flex items-start gap-2.5 text-xs text-[#1a73e8]">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[#174ea6]">
            <span className="font-semibold">Review & Safety Gate:</span> You will review and have full freedom to edit every word of the AI-generated implementation summary, validation steps, and email before anything is dispatched.
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 google-btn-primary flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer"
          >
            <Rocket className="w-5 h-5" />
            <span>Generate CAB Request & Email</span>
          </button>
        </div>

      </div>
    </form>
  );
};
