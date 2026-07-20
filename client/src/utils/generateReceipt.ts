import { jsPDF } from 'jspdf';

export interface ReceiptDonationData {
  _id: string;
  donorName: string;
  email: string;
  amount: number;
  message?: string;
  status?: string;
  date?: string | Date;
  donationType?: 'money' | 'item';
  itemCategory?: string;
  quantity?: number;
  quantityUnit?: string;
}

// Convert numbers into Indian Rupee words string
function numberToWordsINR(amount: number): string {
  if (amount <= 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertNumber(n: number): string {
    if (n < 20) return single[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
    if (n < 1000) return single[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertNumber(n % 100) : '');
    if (n < 100000) return convertNumber(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertNumber(n % 1000) : '');
    if (n < 10000000) return convertNumber(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertNumber(n % 100000) : '');
    return convertNumber(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertNumber(n % 10000000) : '');
  }

  return `Rupees ${convertNumber(Math.floor(amount))} Only`;
}

export const generate80GReceipt = (donation: ReceiptDonationData, campaignTitle: string = 'GiveHope General Cause') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  // 1. Top Decorative Emerald Banner Header
  doc.setFillColor(4, 120, 87); // Emerald 700 #047857
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Organization Header Branding & Details
  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GiveHope Foundation', margin, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.text('OFFICIAL SECTION 80G TAX EXEMPTION DONATION RECEIPT', margin, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Reg. No: IV-1029/2022 | 80G Certificate ID: AAATG7382FRE001 | PAN: AAATG7382F', margin, 32);
  doc.text('Address: Hub 2, Connaught Place, New Delhi - 110001 | Support: contact@givehope.org', margin, 36);

  // Horizontal Header Divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(margin, 40, pageWidth - margin, 40);

  // 3. Receipt Details Metadata Grid (2 Balanced Columns in Card)
  doc.setFillColor(236, 253, 245); // Mint Light #ecfdf5
  doc.setDrawColor(167, 243, 208); // Emerald 200 #a7f3d0
  doc.roundedRect(margin, 44, contentWidth, 26, 3, 3, 'FD');

  const receiptNo = `REC-80G-${donation._id.slice(-8).toUpperCase()}`;
  const formattedDate = donation.date
    ? new Date(donation.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const colLeftX = margin + 5;
  const colRightX = margin + contentWidth / 2 + 5;

  // Left Column Metadata
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Receipt Number:', colLeftX, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(receiptNo, colLeftX + 26, 52);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Date of Issue:', colLeftX, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formattedDate, colLeftX + 26, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Status:', colLeftX, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('Verified & Acknowledged', colLeftX + 26, 64);

  // Right Column Metadata
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('NGO PAN:', colRightX, 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('AAATG7382F', colRightX + 28, 52);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tax Exemption:', colRightX, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Section 80G(5)(vi)', colRightX + 28, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Approval Order:', colRightX, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('AAATG7382FRE001', colRightX + 28, 64);

  // 4. Donor Information Table Block
  let yPos = 76;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Donor Information', margin, yPos);

  yPos += 4;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 32, 3, 3, 'FD');

  const donorLabelX = margin + 5;
  const donorValX = margin + 40;

  // Row 1: Full Name
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Full Name', donorLabelX, yPos + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`:  ${donation.donorName || 'Generous Donor'}`, donorValX - 4, yPos + 8);

  // Row 2: Email Address
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Email Address', donorLabelX, yPos + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`:  ${donation.email || 'N/A'}`, donorValX - 4, yPos + 16);

  // Row 3: Campaign Supported
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cause Supported', donorLabelX, yPos + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`:  ${campaignTitle}`, donorValX - 4, yPos + 24);

  // 5. Contribution Value & Summary Box
  yPos += 38;
  doc.setFillColor(240, 253, 244); // Light Emerald Box #f0fdf4
  doc.setDrawColor(187, 247, 208); // Emerald Border #bbf7d0
  doc.roundedRect(margin, yPos, contentWidth, 34, 3, 3, 'FD');

  const isItem = donation.donationType === 'item';
  const amountDisplay = isItem
    ? `${donation.quantity} ${donation.quantityUnit} (${donation.itemCategory} Contribution)`
    : `INR ${donation.amount.toLocaleString('en-IN')}/-`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Contribution Value:', margin + 5, yPos + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(4, 120, 87);
  doc.text(amountDisplay, margin + 5, yPos + 19);

  if (!isItem) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Amount in Words:', margin + 5, yPos + 27);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(15, 23, 42);
    doc.text(numberToWordsINR(donation.amount), margin + 32, yPos + 27);
  }

  // 80G Tax Deductible Right Badge inside box
  doc.setFillColor(4, 120, 87);
  doc.roundedRect(pageWidth - margin - 42, yPos + 6, 36, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX-DEDUCTIBLE', pageWidth - margin - 39, yPos + 11);

  // 6. Section 80G Statutory Certificate Amber Card
  yPos += 40;
  doc.setFillColor(254, 243, 199); // Amber 100 #fef3c7
  doc.setDrawColor(253, 230, 138); // Amber 200 #fde68a
  doc.roundedRect(margin, yPos, contentWidth, 24, 3, 3, 'FD');

  // Left Amber Accent Strip
  doc.setFillColor(217, 119, 6); // Amber 600 #d97706
  doc.rect(margin, yPos, 2.5, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('Section 80G Statutory Tax Exemption Certificate', margin + 6, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(180, 83, 9); // Amber 700
  const clauseText = 'This donation is eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961 vide Approval Order No. AAATG7382FRE001 dated 15/04/2022. Donors can claim tax deduction when filing annual Income Tax Returns.';
  doc.text(clauseText, margin + 6, yPos + 13, { maxWidth: contentWidth - 12 });

  // 7. Official Seal & Authorized Signatory Footer Block
  yPos += 34;

  // Left Side: Vector Official Stamp / Seal Emblem (Centered, zero overflow)
  const sealCenterX = margin + 22;
  const sealCenterY = yPos + 14;

  // Outer Emerald Circle
  doc.setFillColor(236, 253, 245); // Mint Light #ecfdf5
  doc.setDrawColor(4, 120, 87); // Emerald 700 #047857
  doc.setLineWidth(0.7);
  doc.circle(sealCenterX, sealCenterY, 16, 'FD');

  // Inner Concentric Circle Ring
  doc.setLineWidth(0.35);
  doc.circle(sealCenterX, sealCenterY, 13.8, 'D');

  // Inner Seal Typography (Sized for generous clearance inside circle)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('GIVEHOPE', sealCenterX, sealCenterY - 4.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text('OFFICIAL SEAL', sealCenterX, sealCenterY + 1, { align: 'center' });

  doc.setFontSize(6.5);
  doc.text('NEW DELHI', sealCenterX, sealCenterY + 6.5, { align: 'center' });

  // Right Side: Authorized Signatory
  const sigLineLeftX = pageWidth - margin - 55;
  const sigLineRightX = pageWidth - margin;

  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.setLineWidth(0.4);
  doc.line(sigLineLeftX, yPos + 18, sigLineRightX, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Authorized Signatory', sigLineRightX, yPos + 23, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  doc.text('GiveHope Trust Executive Trustee', sigLineRightX, yPos + 27, { align: 'right' });

  // 8. Bottom Security Integrity Footer
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(margin, 274, pageWidth - margin, 274);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated Section 80G tax receipt issued by GiveHope Foundation. No physical signature required.', pageWidth / 2, 279, { align: 'center' });

  // Bottom Emerald Accent Line
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 292, pageWidth, 5, 'F');

  // Save PDF file
  const fileName = `GiveHope_80G_Receipt_${donation._id.slice(-6)}.pdf`;
  doc.save(fileName);
};

