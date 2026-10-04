import React from 'react';
import { Rocket, User, Sparkles, ChevronDown } from 'lucide-react';
import { UserIdentity, SAMPLE_TEMPLATES, CRQFormData } from '../types/crq';

interface HeaderProps {
  identity: UserIdentity;
  onOpenIdentityModal: () => void;
  onLoadTemplate: (template: CRQFormData) => void;
  activeDefectNumber?: string;
}

export const Header: React.FC<HeaderProps> = ({
  identity,
  onOpenIdentityModal,
  onLoadTemplate,
}) => {
  return (
    <header className="border-b border-[#dadce0] bg-white sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e8f0fe] rounded-lg flex items-center justify-center text-[#1a73e8] border border-[#d2e3fc]">
            <Rocket className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#202124]">
                CRQ<span className="text-[#1a73e8]">-Rocket</span>
              </span>
              <span className="bg-[#e6f4ea] text-[#137333] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#ceead6]">
                CAB Assistant
              </span>
            </div>
            <p className="text-xs text-[#5f6368] hidden sm:block">
              Developer Change Request Engine · Technical Notes to Formal CAB Dossier
            </p>
          </div>
        </div>

        {/* Templates & User Identity Pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick template selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-lg text-xs font-medium text-[#3c4043] transition-colors cursor-pointer shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#f9ab00]" />
              <span>Load Sample</span>
              <ChevronDown className="w-3 h-3 text-[#5f6368]" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-[#dadce0] rounded-xl shadow-lg p-2 hidden group-hover:block z-50">
              <div className="text-[11px] font-semibold uppercase text-[#5f6368] px-2 py-1.5 border-b border-[#f1f3f4]">
                Quick Technical Samples
              </div>
              {SAMPLE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => onLoadTemplate(tpl.data)}
                  className="w-full text-left p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors mb-0.5 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[#202124] flex items-center justify-between">
                    <span>{tpl.name}</span>
                    <span className="text-[10px] text-[#1a73e8] font-medium bg-[#e8f0fe] px-1.5 py-0.5 rounded">
                      {tpl.data.riskLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5f6368] truncate mt-0.5">{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submitter Identity Badge */}
          <button
            onClick={onOpenIdentityModal}
            className="flex items-center gap-2.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-lg text-xs text-[#3c4043] cursor-pointer transition-colors shadow-2xs"
            title="Edit Submitter Identity"
          >
            <div className="w-6 h-6 bg-[#1a73e8] text-white rounded-full flex items-center justify-center font-bold text-[11px]">
              {identity.userName ? identity.userName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-[#202124] leading-tight">
                {identity.userName || 'Set Identity'}
              </div>
              <div className="text-[10px] text-[#5f6368] leading-tight truncate max-w-[130px]">
                {identity.userRole || 'Software Engineer'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
