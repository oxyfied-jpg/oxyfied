import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  QrCode,
  Save,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Award,
  Minus,
  Sliders
} from 'lucide-react';
import { CertificateCanvas } from './CertificateCanvas';
import type {
  CertificateElement,
  CertificateTemplate,
  CertificateVariableKey
} from '../../types/certificate';
import { certificateService } from '../../services/certificateService';

interface CertificateDesignerProps {
  initialTemplate?: CertificateTemplate | null;
  onSave?: (savedTemplate: CertificateTemplate) => void;
  onCancel?: () => void;
}

export const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  initialTemplate,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialTemplate?.name || 'New Certificate Template');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    initialTemplate?.orientation || 'landscape'
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialTemplate?.backgroundImage || null
  );
  const [isDefault, setIsDefault] = useState(initialTemplate?.isDefault ?? false);
  const [isActive, setIsActive] = useState(initialTemplate?.isActive ?? true);
  const [elements, setElements] = useState<CertificateElement[]>(
    initialTemplate?.elements && initialTemplate.elements.length > 0
      ? initialTemplate.elements
      : [
          {
            id: 'elem-header',
            type: 'text',
            label: 'Academy Title',
            content: 'OXYFIED ACADEMY OF ADVANCED COMPUTING',
            x: 10,
            y: 9,
            width: 80,
            height: 5,
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Outfit',
            textAlign: 'center',
            letterSpacing: 4,
            color: '#B45309',
            isVisible: true,
            zIndex: 1
          },
          {
            id: 'elem-title',
            type: 'text',
            label: 'Main Certificate Title',
            content: 'CERTIFICATE OF COMPLETION',
            x: 10,
            y: 16,
            width: 80,
            height: 9,
            fontSize: 34,
            fontWeight: 'bold',
            fontFamily: 'Cinzel',
            textAlign: 'center',
            letterSpacing: 3,
            color: '#0B1120',
            isVisible: true,
            zIndex: 2
          },
          {
            id: 'elem-sub',
            type: 'text',
            label: 'Conferral Subtitle',
            content: 'THIS CREDENTIAL IS PROUDLY CONFERRED UPON',
            x: 15,
            y: 28,
            width: 70,
            height: 4,
            fontSize: 11,
            fontWeight: 'semibold',
            fontFamily: 'Inter',
            textAlign: 'center',
            letterSpacing: 3,
            color: '#64748B',
            isVisible: true,
            zIndex: 3
          },
          {
            id: 'elem-student',
            type: 'variable',
            variableKey: 'studentName',
            label: 'Student Name',
            content: '{{studentName}}',
            x: 10,
            y: 34,
            width: 80,
            height: 10,
            fontSize: 38,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            textAlign: 'center',
            letterSpacing: 1,
            color: '#0B1120',
            isUnderline: true,
            isVisible: true,
            zIndex: 4
          },
          {
            id: 'elem-body',
            type: 'text',
            label: 'Completion Statement',
            content: 'for successfully completing all practical lab audits, technical milestones, and syllabus criteria for',
            x: 15,
            y: 47,
            width: 70,
            height: 5,
            fontSize: 13,
            fontWeight: 'normal',
            fontFamily: 'Inter',
            textAlign: 'center',
            color: '#475569',
            isVisible: true,
            zIndex: 5
          },
          {
            id: 'elem-course',
            type: 'variable',
            variableKey: 'courseTitle',
            label: 'Course Title',
            content: '{{courseTitle}}',
            x: 10,
            y: 54,
            width: 80,
            height: 8,
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'Cinzel',
            textAlign: 'center',
            color: '#B45309',
            isVisible: true,
            zIndex: 6
          },
          {
            id: 'elem-cert-num',
            type: 'variable',
            variableKey: 'certificateNumber',
            label: 'Certificate ID',
            content: 'Credential ID: {{certificateNumber}}',
            x: 8,
            y: 75,
            width: 32,
            height: 4,
            fontSize: 10,
            fontWeight: 'semibold',
            fontFamily: 'Courier New',
            textAlign: 'left',
            color: '#64748B',
            isVisible: true,
            zIndex: 7
          },
          {
            id: 'elem-issue-date',
            type: 'variable',
            variableKey: 'issueDate',
            label: 'Issue Date',
            content: 'Issued: {{issueDate}}',
            x: 8,
            y: 80,
            width: 32,
            height: 4,
            fontSize: 10,
            fontWeight: 'normal',
            fontFamily: 'Inter',
            textAlign: 'left',
            color: '#64748B',
            isVisible: true,
            zIndex: 8
          },
          {
            id: 'elem-qr',
            type: 'qr',
            label: 'Verification QR',
            x: 46,
            y: 71,
            width: 8,
            height: 13,
            color: '#0B1120',
            isVisible: true,
            zIndex: 9
          },
          {
            id: 'elem-mentor',
            type: 'variable',
            variableKey: 'mentorName',
            label: 'Mentor Name',
            content: '{{mentorName}}',
            x: 62,
            y: 75,
            width: 30,
            height: 4,
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: 'Playfair Display',
            textAlign: 'center',
            color: '#0B1120',
            isVisible: true,
            zIndex: 10
          },
          {
            id: 'elem-mentor-sub',
            type: 'text',
            label: 'Mentor Designation',
            content: 'Lead Technical Mentor & Examiner',
            x: 62,
            y: 80,
            width: 30,
            height: 4,
            fontSize: 10,
            fontWeight: 'medium',
            fontFamily: 'Inter',
            textAlign: 'center',
            color: '#64748B',
            isVisible: true,
            zIndex: 11
          }
        ]
  );

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'elements' | 'layers' | 'settings'>('elements');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Update selected element
  const handleUpdateElement = (id: string, updates: Partial<CertificateElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Add new Custom Text
  const handleAddText = () => {
    const newId = `elem-text-${Date.now()}`;
    const newElement: CertificateElement = {
      id: newId,
      type: 'text',
      label: 'Custom Text',
      content: 'New Text Heading',
      x: 30,
      y: 40,
      width: 40,
      height: 6,
      fontSize: 18,
      fontWeight: 'semibold',
      fontFamily: 'Inter',
      textAlign: 'center',
      color: '#0B1120',
      isVisible: true,
      zIndex: elements.length + 1
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  // Add Dynamic Variable
  const handleAddVariable = (variableKey: CertificateVariableKey, defaultLabel: string) => {
    const newId = `elem-var-${Date.now()}`;
    const newElement: CertificateElement = {
      id: newId,
      type: 'variable',
      variableKey,
      label: defaultLabel,
      content: `{{${variableKey}}}`,
      x: 25,
      y: 45,
      width: 50,
      height: 8,
      fontSize: variableKey === 'studentName' ? 32 : variableKey === 'courseTitle' ? 22 : 14,
      fontWeight: 'bold',
      fontFamily: variableKey === 'studentName' ? 'Playfair Display' : 'Cinzel',
      textAlign: 'center',
      color: variableKey === 'courseTitle' ? '#B45309' : '#0B1120',
      isVisible: true,
      zIndex: elements.length + 1
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  // Add QR Code element
  const handleAddQr = () => {
    const newId = `elem-qr-${Date.now()}`;
    const newElement: CertificateElement = {
      id: newId,
      type: 'qr',
      label: 'Public Verification QR',
      x: 45,
      y: 72,
      width: 10,
      height: 14,
      color: '#0B1120',
      isVisible: true,
      zIndex: elements.length + 1
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  // Add Divider line
  const handleAddDivider = () => {
    const newId = `elem-divider-${Date.now()}`;
    const newElement: CertificateElement = {
      id: newId,
      type: 'divider',
      label: 'Decorative Divider',
      x: 25,
      y: 50,
      width: 50,
      height: 0.4,
      backgroundColor: '#D4AF37',
      isVisible: true,
      zIndex: elements.length + 1
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  // Upload image / logo / signature / background asset
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetType: 'background' | 'logo' | 'signature' | 'badge' | 'image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await certificateService.uploadAsset(file, targetType === 'background' ? 'background' : 'asset');
      
      if (targetType === 'background') {
        setBackgroundImage(res.url);
        showNotification('success', 'High-resolution background image applied.');
      } else {
        const newId = `elem-${targetType}-${Date.now()}`;
        const newElement: CertificateElement = {
          id: newId,
          type: targetType === 'signature' ? 'signature' : targetType === 'logo' ? 'logo' : targetType === 'badge' ? 'badge' : 'image',
          label: targetType === 'signature' ? 'Signature Image' : targetType === 'logo' ? 'Academy Logo' : targetType === 'badge' ? 'Accreditation Badge' : 'Graphic Asset',
          imageUrl: res.url,
          x: targetType === 'logo' ? 10 : targetType === 'signature' ? 65 : 45,
          y: targetType === 'logo' ? 8 : targetType === 'signature' ? 70 : 40,
          width: targetType === 'logo' ? 12 : targetType === 'signature' ? 18 : 12,
          height: targetType === 'logo' ? 10 : targetType === 'signature' ? 8 : 12,
          isVisible: true,
          zIndex: elements.length + 1
        };
        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newId);
        showNotification('success', `${newElement.label} added to canvas.`);
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.error || 'Failed to upload image file.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Duplicate Element
  const handleDuplicateElement = (id: string) => {
    const elem = elements.find((e) => e.id === id);
    if (!elem) return;
    const newId = `elem-${Date.now()}`;
    const duplicated: CertificateElement = {
      ...elem,
      id: newId,
      x: Math.min(elem.x + 3, 90),
      y: Math.min(elem.y + 3, 90),
      zIndex: elements.length + 1
    };
    setElements((prev) => [...prev, duplicated]);
    setSelectedElementId(newId);
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Save template to DB
  const handleSave = async () => {
    if (!name.trim()) {
      showNotification('error', 'Please provide a name for this certificate template.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        description,
        orientation,
        width: orientation === 'portrait' ? 794 : 1123,
        height: orientation === 'portrait' ? 1123 : 794,
        backgroundImage,
        elements,
        isDefault,
        isActive
      };

      let saved: CertificateTemplate;
      if (initialTemplate?.id) {
        saved = await certificateService.updateTemplate(initialTemplate.id, payload);
        showNotification('success', `Template "${saved.name}" updated successfully.`);
      } else {
        saved = await certificateService.createTemplate(payload);
        showNotification('success', `Template "${saved.name}" created successfully.`);
      }

      onSave?.(saved);
    } catch (err: any) {
      showNotification('error', err.response?.data?.error || 'Failed to save certificate template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-[#F3F1EC] text-stone-900 rounded-3xl overflow-hidden border border-stone-200/80 shadow-2xl animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Templates"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base font-display font-extrabold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none transition-colors px-1 py-0.5 rounded"
              placeholder="Template Name..."
            />
            <span className="text-[11px] text-stone-500 block px-1">
              Visual Canvas Studio • {orientation === 'landscape' ? 'A4 Landscape (1123 × 794 px)' : 'A4 Portrait (794 × 1123 px)'}
            </span>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
              className="p-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-stone-700 px-1.5 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
              className="p-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="p-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Orientation Toggle */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                orientation === 'landscape'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Landscape
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                orientation === 'portrait'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Portrait
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Template</span>
          </button>
        </div>
      </header>

      {/* Notifications banner */}
      {notification && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-700">
            ×
          </button>
        </div>
      )}

      {/* Main Studio Body: Left Elements/Tool Panel, Center Canvas, Right Inspector Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar / Insert Assets */}
        <aside className="w-72 bg-white border-r border-stone-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Design Elements</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {elements.length} Elements
            </span>
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* 1. Dynamic Variables */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Dynamic Placeholders
              </label>
              <p className="text-[11px] text-stone-500 leading-snug">
                Click to insert placeholders replaced dynamically upon certificate issue.
              </p>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {[
                  { key: 'studentName', label: '{{studentName}}', desc: 'Student Full Name' },
                  { key: 'courseTitle', label: '{{courseTitle}}', desc: 'Course Track Title' },
                  { key: 'certificateNumber', label: '{{certificateNumber}}', desc: 'Unique Credential ID' },
                  { key: 'issueDate', label: '{{issueDate}}', desc: 'Issuance Date' },
                  { key: 'completionDate', label: '{{completionDate}}', desc: 'Completion Date' },
                  { key: 'duration', label: '{{duration}}', desc: 'Track Duration (e.g. 10 Weeks)' },
                  { key: 'mentorName', label: '{{mentorName}}', desc: 'Lead Technical Mentor' },
                  { key: 'organizationName', label: '{{organizationName}}', desc: 'Organization ("Oxyfied")' }
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleAddVariable(v.key as CertificateVariableKey, v.desc)}
                    className="flex flex-col items-start px-3 py-2 bg-stone-50 hover:bg-amber-50/70 border border-stone-200/80 hover:border-amber-400/80 rounded-xl transition-all text-left cursor-pointer group"
                  >
                    <span className="text-xs font-mono font-bold text-amber-800 group-hover:text-amber-900">
                      {v.label}
                    </span>
                    <span className="text-[10px] text-stone-500">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Text & Shapes */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-stone-700" />
                Custom Typography & Shapes
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddText}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                >
                  <Type className="w-4 h-4 text-stone-600" />
                  <span>Add Text</span>
                </button>
                <button
                  onClick={handleAddDivider}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4 text-stone-600" />
                  <span>Gold Line</span>
                </button>
              </div>
            </div>

            {/* 3. Verification QR Code */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-stone-700" />
                Verification Tools
              </label>
              <button
                onClick={handleAddQr}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Add Verification QR Code</span>
              </button>
            </div>

            {/* 4. Upload Assets (Logo, Signature, Background) */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-700" />
                Images & Visual Assets
              </label>

              {/* Upload Background */}
              <label className="w-full flex flex-col items-center justify-center p-3 bg-stone-50 hover:bg-amber-50/40 border border-dashed border-stone-300 hover:border-amber-400 rounded-xl cursor-pointer transition-all text-center">
                <Upload className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-xs font-bold text-stone-800">
                  {backgroundImage ? 'Replace Background Image' : 'Upload Background Image'}
                </span>
                <span className="text-[10px] text-stone-400">High-res PNG / JPG / SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(e, 'background')}
                  className="hidden"
                />
              </label>

              {backgroundImage && (
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="w-full text-xs text-rose-600 hover:text-rose-700 font-semibold py-1 hover:underline text-center cursor-pointer"
                >
                  Remove Custom Background
                </button>
              )}

              {/* Upload Logo / Signature Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 transition-colors cursor-pointer">
                  <Award className="w-3.5 h-3.5 text-stone-600" />
                  <span>Signature</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={(e) => handleFileUpload(e, 'signature')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center bg-[#EBE7DF] overflow-auto p-4 sm:p-8 relative">
          <CertificateCanvas
            orientation={orientation}
            backgroundImage={backgroundImage}
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            isEditable={true}
            zoom={zoom}
          />
        </main>

        {/* Right Inspector & Layers Sidebar */}
        <aside className="w-80 bg-white border-l border-stone-200 flex flex-col overflow-y-auto">
          {/* Sidebar Tab Header */}
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'elements'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/40'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Style Inspector
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'layers'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/40'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Layers ({elements.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-amber-500 text-amber-800 bg-amber-50/40'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Config
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {activeTab === 'elements' ? (
              selectedElement ? (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-900">{selectedElement.label || selectedElement.type}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateElement(selectedElement.id)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title={selectedElement.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {selectedElement.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content input for text elements */}
                  {(selectedElement.type === 'text' || selectedElement.type === 'variable') && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-700 block">Content Template</label>
                      <textarea
                        rows={2}
                        value={selectedElement.content || ''}
                        onChange={(e) => handleUpdateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium resize-none"
                      />
                    </div>
                  )}

                  {/* Typography styling */}
                  {(selectedElement.type === 'text' || selectedElement.type === 'variable') && (
                    <div className="space-y-3 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">Typography</span>

                      {/* Font Family */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-stone-500">Font Family</label>
                        <select
                          value={selectedElement.fontFamily || 'Inter'}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { fontFamily: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer"
                        >
                          <option value="Inter">Inter (Clean Modern Sans)</option>
                          <option value="Outfit">Outfit (Geometric Display)</option>
                          <option value="Cinzel">Cinzel (Luxury Classical Serif)</option>
                          <option value="Playfair Display">Playfair Display (Elegant Editorial)</option>
                          <option value="Montserrat">Montserrat (Contemporary Headline)</option>
                          <option value="Courier New">Courier New (Technical Monospace)</option>
                        </select>
                      </div>

                      {/* Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-stone-500">Size (px)</label>
                          <input
                            type="number"
                            min="8"
                            max="72"
                            value={selectedElement.fontSize || 16}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                            className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-stone-500">Weight</label>
                          <select
                            value={selectedElement.fontWeight || 'normal'}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { fontWeight: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer"
                          >
                            <option value="normal">Regular</option>
                            <option value="medium">Medium</option>
                            <option value="semibold">SemiBold</option>
                            <option value="bold">Bold</option>
                            <option value="800">ExtraBold</option>
                          </select>
                        </div>
                      </div>

                      {/* Alignment & Letter Spacing */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-stone-500">Alignment</label>
                          <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => handleUpdateElement(selectedElement.id, { textAlign: align })}
                                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg capitalize ${
                                  selectedElement.textAlign === align
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-stone-500">Spacing (px)</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={selectedElement.letterSpacing || 0}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) || 0 })}
                            className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Color Picker & Presets */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-stone-500 block">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.color || '#0B1120'}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                          />
                          <input
                            type="text"
                            value={selectedElement.color || '#0B1120'}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                            className="flex-1 px-2.5 py-1 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>
                        {/* Color swatches */}
                        <div className="flex gap-1.5 pt-1">
                          {['#0B1120', '#B45309', '#D4AF37', '#1E3A8A', '#475569', '#047857'].map((c) => (
                            <button
                              key={c}
                              onClick={() => handleUpdateElement(selectedElement.id, { color: c })}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-stone-300/80 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Position Coordinates Inspector */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">Geometry (%)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-500">X Position</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.x}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-500">Y Position</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.y}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-500">Width</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.width}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { width: parseFloat(e.target.value) || 1 })}
                          className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-stone-500">Height</span>
                        <input
                          type="number"
                          step="0.5"
                          value={selectedElement.height}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { height: parseFloat(e.target.value) || 1 })}
                          className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <Sliders className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs font-medium">Select an element on canvas to inspect and edit its properties.</p>
                </div>
              )
            ) : activeTab === 'layers' ? (
              /* Layers Manager */
              <div className="space-y-1.5">
                {[...elements].reverse().map((elem) => {
                  const isSelected = elem.id === selectedElementId;
                  return (
                    <div
                      key={elem.id}
                      onClick={() => setSelectedElementId(elem.id)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 font-bold'
                          : 'bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {elem.type === 'text' || elem.type === 'variable' ? (
                          <Type className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                        ) : elem.type === 'qr' ? (
                          <QrCode className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{elem.label || elem.content || elem.type}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateElement(elem.id, { isVisible: elem.isVisible === false ? true : false });
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          {elem.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(elem.id);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Template Config & Metadata */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">Template Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 block">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-stone-800">Set as System Default Template</span>
                  </label>
                  <p className="text-[10px] text-stone-400 pl-6">
                    Courses without a specific template assignment will automatically use this default template.
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer select-none pt-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-stone-800">Template Active</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
