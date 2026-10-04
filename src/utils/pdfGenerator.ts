import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CRQData {
  defectNumber: string;
  title: string;
  theFix: string;
  testingDetails: string;
  releaseDate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  internalApprovers: string;
  userName: string;
  userRole: string;
  implementationSummary: string;
  validationSteps: string;
  emailSubject?: string;
  emailBody?: string;
}

export function generateCRQPdf(data: CRQData): {
  doc: jsPDF;
  blob: Blob;
  base64: string;
  dataUri: string;
  fileName: string;
  download: () => void;
} {
  // Monochrome (Black & White), A4, standard fonts
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Header Bar (Solid Black with White Text)
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, currentY, contentWidth, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('CHANGE ADVISORY BOARD (CAB) FORMAL RELEASE DOSSIER', margin + 4, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CLASSIFICATION: RESTRICTED', pageWidth - margin - 4, currentY + 9, { align: 'right' });

  currentY += 20;

  // Document Title: CRQ Report: [Defect #] - [Title]
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);

  const displayDefect = data.defectNumber.trim() || 'DEF-UNASSIGNED';
  const displayTitle = data.title.trim() || 'Untitled Change Request';
  const headerTitle = `CRQ Report: ${displayDefect} - ${displayTitle}`;

  // Split title if long
  const titleLines = doc.splitTextToSize(headerTitle, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 2;

  // Subtitle / Generated Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(`Document Reference: CRQ-${displayDefect} | Generated: ${nowStr}`, margin, currentY);
  currentY += 6;

  // Top divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Summary Table: 2-column table showing Creator, Role, Release Date, Risk Level, and Internal Approvers
  const tableRows = [
    ['Creator / Submitter', data.userName.trim() || 'Engineering Submitter'],
    ['Submitter Role', data.userRole.trim() || 'Software Engineer'],
    ['Defect / Ticket #', displayDefect],
    ['Target Release Date', data.releaseDate || 'Immediate / Next Scheduled Deployment Window'],
    ['Assessed Risk Level', `${data.riskLevel.toUpperCase()} RISK`],
    ['Internal Approvers', data.internalApprovers.trim() || 'Peer Review Verified / CI Pipeline Passed'],
    ['Authorization Status', 'PENDING CAB STAKEHOLDER APPROVAL'],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: 'METRIC / ATTRIBUTE', styles: { halign: 'left', fontStyle: 'bold' } },
        { content: 'SPECIFICATION DETAILS', styles: { halign: 'left', fontStyle: 'bold' } },
      ],
    ],
    body: tableRows,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 2.4,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 248, 248] },
      1: { cellWidth: contentWidth - 55 },
    },
  });

  // Get Y position after table
  const lastAutoTable = (doc as any).lastAutoTable;
  currentY = (lastAutoTable ? lastAutoTable.finalY : currentY) + 8;

  // Helper to ensure page bounds
  function checkPageBreak(requiredHeight: number) {
    if (currentY + requiredHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin + 5;
    }
  }

  // Section 1: Implementation Summary
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Implementation Summary & Technical Specifications', margin, currentY);
  currentY += 2;
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 5;

  const summaryText = data.implementationSummary || data.theFix || '[TECHNICAL DETAIL REQUIRED: Specification of change]';
  
  // Format body text, handling code blocks or normal paragraphs
  const summaryParagraphs = summaryText.split('\n\n');
  for (const para of summaryParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check if it's a code block
    if (trimmed.startsWith('```') || trimmed.includes('{\n') || trimmed.includes('function ')) {
      checkPageBreak(30);
      const cleanCode = trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      const codeLines = doc.splitTextToSize(cleanCode, contentWidth - 8);
      const blockHeight = codeLines.length * 4.2 + 6;
      
      checkPageBreak(blockHeight);
      
      // Gray background box for code
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, currentY, contentWidth, blockHeight, 'FD');

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text(codeLines, margin + 4, currentY + 5);

      currentY += blockHeight + 5;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      const textLines = doc.splitTextToSize(trimmed, contentWidth);
      checkPageBreak(textLines.length * 4.5 + 4);
      doc.text(textLines, margin, currentY);
      currentY += textLines.length * 4.5 + 3;
    }
  }

  currentY += 4;

  // Section 2: Validation Steps
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Validation Steps & Quality Assurance', margin, currentY);
  currentY += 2;
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 5;

  const validationText = data.validationSteps || data.testingDetails || '[TECHNICAL DETAIL REQUIRED: Verification details]';
  const validationParagraphs = validationText.split('\n\n');
  for (const para of validationParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('```')) {
      const cleanCode = trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      const codeLines = doc.splitTextToSize(cleanCode, contentWidth - 8);
      const blockHeight = codeLines.length * 4.2 + 6;
      checkPageBreak(blockHeight);
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(180, 180, 180);
      doc.rect(margin, currentY, contentWidth, blockHeight, 'FD');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text(codeLines, margin + 4, currentY + 5);
      currentY += blockHeight + 5;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      const textLines = doc.splitTextToSize(trimmed, contentWidth);
      checkPageBreak(textLines.length * 4.5 + 4);
      doc.text(textLines, margin, currentY);
      currentY += textLines.length * 4.5 + 3;
    }
  }

  // Section 3: Rollback & Risk Controls
  checkPageBreak(30);
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('3. Rollback Procedure & Environmental Safeguards', margin, currentY);
  currentY += 2;
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  const rollbackText = `In accordance with enterprise deployment policy, this release retains an automated rollback capability. Should any unexpected metric deviation, latency anomaly, or error spike trigger telemetry alarms during the canary phase, the pipeline will immediately restore the preceding verified release artifact. Mean Time to Recovery (MTTR) under standard rollback conditions is estimated at under 180 seconds.`;
  const rollbackLines = doc.splitTextToSize(rollbackText, contentWidth);
  doc.text(rollbackLines, margin, currentY);
  currentY += rollbackLines.length * 4.5 + 8;

  // Sign-off signature block
  checkPageBreak(25);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.line(margin, currentY, margin + 60, currentY);
  doc.line(margin + 90, currentY, margin + 150, currentY);
  currentY += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lead Submitter: ${data.userName || 'Engineer'}`, margin, currentY);
  doc.text(`CAB Reviewer Sign-off: ____________________`, margin + 90, currentY);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Title: ${data.userRole || 'Engineering Lead'}`, margin, currentY);
  doc.text(`Approval Date: ___________________________`, margin + 90, currentY);

  // Add Page Numbers & Footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(
      `CRQ-Rocket Dossier | ${displayDefect} | Confidential - CAB Review Only`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const safeFileName = `CRQ-${(data.defectNumber || 'DEF').replace(/[^a-zA-Z0-9_-]/g, '_')}-${(data.title || 'report').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const blob = doc.output('blob');
  const base64 = doc.output('datauristring');

  return {
    doc,
    blob,
    base64,
    dataUri: base64,
    fileName: safeFileName,
    download: () => {
      doc.save(safeFileName);
    },
  };
}
