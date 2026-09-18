import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export interface RenderCertificateData {
  certificateNumber: string;
  studentName: string;
  studentFullName?: string;
  name?: string;
  courseTitle: string;
  courseName?: string;
  issueDate: string;
  completionDate?: string;
  duration?: string;
  mentorName?: string;
  instructorName?: string;
  organizationName?: string;
  verificationUrl: string;
}

export interface CertificateLayoutElement {
  id: string;
  type: 'text' | 'variable' | 'image' | 'signature' | 'logo' | 'qr' | 'badge' | 'divider' | 'shape';
  variableKey?: string;
  label?: string;
  content?: string;
  imageUrl?: string;
  x: number; // percentage (0 to 100) or px
  y: number; // percentage (0 to 100) or px
  width: number; // percentage (0 to 100) or px
  height: number; // percentage (0 to 100) or px
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  color?: string;
  opacity?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  zIndex?: number;
  isVisible?: boolean;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
}

export interface CertificateTemplateConfig {
  orientation: 'landscape' | 'portrait';
  width?: number;
  height?: number;
  backgroundImage?: string | null;
  elements: CertificateLayoutElement[];
}

// Helper to convert hex color to PDF-lib rgb
function parseColor(hex?: string): { r: number; g: number; b: number } {
  if (!hex) return { r: 0.1, g: 0.1, b: 0.1 };
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return { r: 0.1, g: 0.1, b: 0.1 };
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b
  };
}

// Helper to load image buffer from local path or URL or data URL safely
async function fetchImageBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    const trimmed = imageUrl.trim();
    if (!trimmed) return null;

    // 1. Data URL (Base64)
    if (trimmed.startsWith('data:')) {
      const parts = trimmed.split(',');
      if (parts.length === 2) {
        return Buffer.from(parts[1], 'base64');
      }
    }

    // 2. Relative local upload (/uploads/xxx or server/uploads/xxx or public/uploads/xxx)
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
      const filename = path.basename(trimmed);
      const possiblePaths = [
        path.resolve(process.cwd(), 'public/uploads', filename),
        path.resolve(process.cwd(), 'server/uploads', filename),
        path.resolve(process.cwd(), 'uploads', filename),
        path.resolve('public/uploads', filename),
        path.resolve('server/uploads', filename),
        path.resolve('uploads', filename),
        path.resolve('/tmp/uploads', filename)
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
          return fs.readFileSync(p);
        }
      }
    }

    // 3. Absolute local path
    if (fs.existsSync(trimmed)) {
      return fs.readFileSync(trimmed);
    }

    // 4. Remote HTTP(S) URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const resp = await axios.get(trimmed, {
        responseType: 'arraybuffer',
        timeout: 10000,
        validateStatus: (status) => status === 200
      });
      return Buffer.from(resp.data);
    }
  } catch (err: any) {
    const sanitized = (imageUrl || '').split('?')[0];
    console.warn(`[CertificatePdf] Could not load image from ${sanitized}:`, err?.message || err);
  }
  return null;
}

// Embed image into pdf-lib document (supporting PNG, JPG, JPEG) safely
async function embedImageToPdf(pdfDoc: PDFDocument, imageBuffer: Buffer) {
  try {
    if (!imageBuffer || imageBuffer.length < 4) return null;

    // Check magic bytes for PNG: 89 50 4E 47
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47) {
      return await pdfDoc.embedPng(imageBuffer);
    }
    // Check magic bytes for JPEG: FF D8 FF
    if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
      return await pdfDoc.embedJpg(imageBuffer);
    }
    // Fallback: try embedPng then embedJpg
    try {
      return await pdfDoc.embedPng(imageBuffer);
    } catch {
      return await pdfDoc.embedJpg(imageBuffer);
    }
  } catch (e: any) {
    console.warn('[CertificatePdf] Failed to embed image:', e?.message || e);
    return null;
  }
}

// Helper to draw default luxury vector border
function drawFallbackLuxuryBorder(page: PDFPage, pageWidth: number, pageHeight: number) {
  // Default luxury background tint if none provided or if loading failed
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.98, 0.97, 0.95), // Off-white cream
  });
  // Luxury subtle border
  page.drawRectangle({
    x: 18,
    y: 18,
    width: pageWidth - 36,
    height: pageHeight - 36,
    borderColor: rgb(0.85, 0.72, 0.45), // Gold accent
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 24,
    y: 24,
    width: pageWidth - 48,
    height: pageHeight - 48,
    borderColor: rgb(0.9, 0.85, 0.75),
    borderWidth: 0.8,
  });
}

export class CertificatePdfService {
  /**
   * Generates a high-resolution Vector PDF buffer from template configuration and real data
   */
  public static async generateCertificatePdf(
    template: CertificateTemplateConfig,
    data: RenderCertificateData
  ): Promise<Buffer> {
    // Standard A4 dimensions in points (72 points per inch)
    // Landscape: 841.89 x 595.28 pt (11.69 x 8.27 in)
    // Portrait: 595.28 x 841.89 pt
    const isLandscape = template.orientation !== 'portrait';
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Embed Standard Fonts for vector sharpness
    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

    // 1. Draw Background (Failure-Safe)
    let bgRendered = false;
    if (template.backgroundImage) {
      try {
        const bgBuffer = await fetchImageBuffer(template.backgroundImage);
        if (bgBuffer) {
          const bgImage = await embedImageToPdf(pdfDoc, bgBuffer);
          if (bgImage) {
            page.drawImage(bgImage, {
              x: 0,
              y: 0,
              width: pageWidth,
              height: pageHeight,
            });
            bgRendered = true;
          }
        }
      } catch (err: any) {
        console.warn('[CertificatePdf] Failed to draw background image, falling back to luxury vector border:', err?.message || err);
      }
    }

    if (!bgRendered) {
      drawFallbackLuxuryBorder(page, pageWidth, pageHeight);
    }

    // Normalized recipient data
    const studentName = data.studentName || data.studentFullName || data.name || 'Student Name';
    const courseTitle = data.courseTitle || data.courseName || 'Course Title';
    const mentorName = data.mentorName || data.instructorName || 'Lead Mentor';

    // Sort elements by zIndex if present
    const sortedElements = [...(template.elements || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // 2. Render Elements
    for (const el of sortedElements) {
      if (el.isVisible === false) continue;

      // Coordinate normalization: Canvas uses top-left origin (0,0 is top-left),
      // PDF-lib uses bottom-left origin (0,0 is bottom-left).
      // el.x and el.y are in percentage (0 to 100)
      const elWidthPt = (el.width / 100) * pageWidth;
      const elHeightPt = (el.height / 100) * pageHeight;
      const elXPt = (el.x / 100) * pageWidth;
      const elYPt = pageHeight - ((el.y / 100) * pageHeight) - elHeightPt;

      const elementOpacity = typeof el.opacity === 'number' ? el.opacity : 1;

      // --- TEXT / DYNAMIC VARIABLE ---
      if (el.type === 'text' || el.type === 'variable') {
        let textContent = el.content || '';

        if (el.type === 'variable' && el.variableKey) {
          switch (el.variableKey) {
            case 'studentName':
            case 'studentFullName':
            case 'name':
              textContent = studentName;
              break;
            case 'courseName':
            case 'courseTitle':
              textContent = courseTitle;
              break;
            case 'certificateNumber':
              textContent = data.certificateNumber || 'OXY-000000';
              break;
            case 'issueDate':
              textContent = data.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              break;
            case 'completionDate':
              textContent = data.completionDate || data.issueDate || '';
              break;
            case 'duration':
              textContent = data.duration || 'Comprehensive Track';
              break;
            case 'mentorName':
            case 'instructorName':
              textContent = mentorName;
              break;
            case 'organizationName':
              textContent = data.organizationName || 'Oxyfied Official Credential Authority';
              break;
            default:
              textContent = el.content || '';
          }
        } else if (textContent.includes('{{')) {
          // Replace inline variables e.g. {{studentName}}
          textContent = textContent
            .replace(/\{\{(studentName|studentFullName|name|student_name)\}\}/gi, studentName)
            .replace(/\{\{(courseName|courseTitle|course_title|course_name)\}\}/gi, courseTitle)
            .replace(/\{\{(certificateNumber|certificate_number|certNumber)\}\}/gi, data.certificateNumber || '')
            .replace(/\{\{(issueDate|issue_date)\}\}/gi, data.issueDate || '')
            .replace(/\{\{(completionDate|completion_date)\}\}/gi, data.completionDate || data.issueDate || '')
            .replace(/\{\{(duration|courseDuration)\}\}/gi, data.duration || '')
            .replace(/\{\{(mentorName|instructorName|mentor_name|instructor_name)\}\}/gi, mentorName)
            .replace(/\{\{(organizationName|organization_name|orgName)\}\}/gi, data.organizationName || 'Oxyfied Official Credential Authority')
            .replace(/\{\{(verificationUrl|verification_url)\}\}/gi, data.verificationUrl || '');
        }

        if (!textContent.trim()) continue;

        // Determine font family and style
        let font = fontHelvetica;
        const family = (el.fontFamily || 'Inter').toLowerCase();
        const isBold = el.isBold || el.fontWeight === 'bold' || el.fontWeight === '800' || el.fontWeight === '900' || el.fontWeight === 'semibold';
        const isItalic = el.isItalic;

        if (family.includes('cinzel') || family.includes('playfair') || family.includes('serif') || family.includes('times')) {
          if (isBold && isItalic) font = fontTimesBold;
          else if (isBold) font = fontTimesBold;
          else if (isItalic) font = fontTimesItalic;
          else font = fontTimes;
        } else if (family.includes('courier') || family.includes('mono')) {
          if (isBold) font = fontCourierBold;
          else font = fontCourier;
        } else {
          if (isBold && isItalic) font = fontHelveticaBold;
          else if (isBold) font = fontHelveticaBold;
          else if (isItalic) font = fontHelveticaOblique;
          else font = fontHelvetica;
        }

        // Scale font size proportionally from canvas standard
        const baseFontSize = el.fontSize || 16;
        // In 1123 canvas px vs 841.89 pt: scale ratio ~ 0.75
        const ptFontSize = baseFontSize * (pageWidth / 1123);

        const colorObj = parseColor(el.color);
        const textWidth = font.widthOfTextAtSize(textContent, ptFontSize);
        const textHeight = font.heightAtSize(ptFontSize);

        let drawX = elXPt;
        if (el.textAlign === 'center') {
          drawX = elXPt + (elWidthPt - textWidth) / 2;
        } else if (el.textAlign === 'right') {
          drawX = elXPt + elWidthPt - textWidth;
        }

        // Vertical center in element box
        const drawY = elYPt + (elHeightPt - textHeight) / 2 + (textHeight * 0.2);

        page.drawText(textContent, {
          x: drawX,
          y: drawY,
          size: ptFontSize,
          font: font,
          color: rgb(colorObj.r, colorObj.g, colorObj.b),
          opacity: elementOpacity,
        });

        // Draw Underline if specified
        if (el.isUnderline) {
          page.drawLine({
            start: { x: drawX, y: drawY - 2 },
            end: { x: drawX + textWidth, y: drawY - 2 },
            thickness: Math.max(0.75, ptFontSize * 0.05),
            color: rgb(colorObj.r, colorObj.g, colorObj.b),
            opacity: elementOpacity,
          });
        }
      }

      // --- IMAGES / LOGOS / SIGNATURES / BADGES (Failure-Safe) ---
      else if (['image', 'logo', 'signature', 'badge'].includes(el.type)) {
        if (el.imageUrl) {
          try {
            const imgBuffer = await fetchImageBuffer(el.imageUrl);
            if (imgBuffer) {
              const embeddedImg = await embedImageToPdf(pdfDoc, imgBuffer);
              if (embeddedImg) {
                page.drawImage(embeddedImg, {
                  x: elXPt,
                  y: elYPt,
                  width: elWidthPt,
                  height: elHeightPt,
                  opacity: elementOpacity,
                });
              }
            }
          } catch (imgErr: any) {
            console.warn('[CertificatePdf] Failed to render element image:', imgErr?.message || imgErr);
          }
        }
      }

      // --- QR CODE (Failure-Safe) ---
      else if (el.type === 'qr') {
        const qrUrl = data.verificationUrl || `https://oxyfied.com/verify-certificate/${data.certificateNumber}`;
        try {
          const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
            type: 'png',
            width: 300,
            margin: 1,
            color: {
              dark: el.color || '#0B1120',
              light: '#FFFFFF'
            }
          });
          const embeddedQr = await pdfDoc.embedPng(qrPngBuffer);
          page.drawImage(embeddedQr, {
            x: elXPt,
            y: elYPt,
            width: elWidthPt,
            height: elHeightPt,
            opacity: elementOpacity,
          });
        } catch (qrErr: any) {
          console.warn('[CertificatePdf] Failed to render QR code:', qrErr?.message || qrErr);
        }
      }

      // --- DIVIDER / SHAPE ---
      else if (el.type === 'divider' || el.type === 'shape') {
        const colorObj = parseColor(el.backgroundColor || el.color || '#D4AF37');
        page.drawRectangle({
          x: elXPt,
          y: elYPt,
          width: elWidthPt,
          height: elHeightPt,
          color: rgb(colorObj.r, colorObj.g, colorObj.b),
          opacity: elementOpacity,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
