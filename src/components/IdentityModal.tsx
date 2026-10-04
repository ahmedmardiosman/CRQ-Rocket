import React, { useState } from 'react';
import { UserIdentity } from '../types/crq';
import { User, ShieldCheck, Mail, ArrowRight, X } from 'lucide-react';

interface IdentityModalProps {
  isOpen: boolean;
  onClose?: () => void;
  identity: UserIdentity;
  onSave: (identity: UserIdentity) => void;
  isFirstTime?: boolean;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  onClose,
  identity,
  onSave,
  isFirstTime = false,
}) => {
  const [name, setName] = useState(identity.userName || '');
  const [role, setRole] = useState(identity.userRole || '');
  const [email, setEmail] = useState(identity.userEmail || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('Please provide both your Name and Engineering Role.');
      return;
    }

    onSave({
      userName: name.trim(),
      userRole: role.trim(),
      userEmail: email.trim(),
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#dadce0] p-6 text-[#202124]">
        {!isFirstTime && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-[#f1f3f4] rounded-full text-[#5f6368] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#e8f0fe] rounded-full flex items-center justify-center text-[#1a73e8] font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#202124]">
              {isFirstTime ? 'Developer Identity Setup' : 'Update Submitter Identity'}
            </h2>
            <p className="text-xs text-[#5f6368]">
              Stamped on generated CAB PDF dossiers and approval emails.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#fce8e6] border border-[#d93025] rounded-lg text-[#c5221f] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1a73e8]" />
                Full Name / Handle *
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
                Engineering Role / Title *
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer / Core Platform Lead"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3c4043] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1a73e8]" />
                Your Email (Used for "Send Test to Me")
              </span>
            </label>
            <input
              type="email"
              placeholder="e.g. ahmedmardiosman@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full google-input px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            {!isFirstTime && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="google-btn-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="google-btn-primary px-5 py-2 text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{isFirstTime ? 'Save & Continue' : 'Update Identity'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
