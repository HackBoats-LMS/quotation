"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTemplateMappings } from "../../actions";
import GenerateModal from "./GenerateModal";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Check, 
  AlertCircle, 
  Trash2, 
  Move,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Plus,
  X,
  Maximize2,
  Minimize2,
  FileDown
} from "lucide-react";

// Available fields metadata
const AVAILABLE_FIELDS = [
  { id: "customer_name", label: "Customer Name" },
  { id: "customer_address", label: "Customer Address" },
  { id: "customer_phone", label: "Customer Phone Number" },
  { id: "quotation_number", label: "Quotation Number" },
  { id: "date", label: "Date" },
  { id: "item_table", label: "Item Table" },
  { id: "subtotal", label: "Subtotal" },
  { id: "tax", label: "Tax" },
  { id: "grand_total", label: "Grand Total" },
  { id: "notes", label: "Notes" },
  { id: "company_logo", label: "Company Logo" },
];

interface PlacedField {
  id: string; // field id
  label: string;
  page: number;
  x: number; // percentage left
  y: number; // percentage top
  fontSize?: number;
}

interface CustomFieldDef {
  id: string;   // e.g. "custom_company_reg"
  label: string; // e.g. "Company Registration No"
}

interface EditorClientProps {
  template: {
    id: string;
    name: string;
    pdf_path: string;
    mappings: any; // Record<string, { page: number, x: number, y: number }> + _customFields
  };
}

export default function EditorClient({ template }: EditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Restore custom field definitions from saved mappings
  const parseInitialCustomFields = (): CustomFieldDef[] => {
    try {
      const maps = template.mappings || {};
      return Array.isArray(maps._customFields) ? maps._customFields : [];
    } catch {
      return [];
    }
  };

  // Convert database mappings (JSON) to local placed fields state
  const parseInitialMappings = (customDefs: CustomFieldDef[]): PlacedField[] => {
    try {
      const initial: PlacedField[] = [];
      const maps = template.mappings || {};
      const allFields = [
        ...AVAILABLE_FIELDS,
        ...customDefs,
      ];
      Object.entries(maps).forEach(([fieldId, coord]: [string, any]) => {
        if (fieldId === "_customFields") return; // skip metadata key
        const fieldMeta = allFields.find(f => f.id === fieldId);
        if (fieldMeta && coord && typeof coord.x === "number") {
          initial.push({
            id: fieldId,
            label: fieldMeta.label,
            page: coord.page || 1,
            x: coord.x,
            y: coord.y,
            fontSize: coord.fontSize || 10,
          });
        }
      });
      return initial;
    } catch (e) {
      console.error("Error parsing mappings:", e);
      return [];
    }
  };

  const initialCustomFields = parseInitialCustomFields();
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>(initialCustomFields);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [placedFields, setPlacedFields] = useState<PlacedField[]>(parseInitialMappings(initialCustomFields));
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderStateRef = useRef<{
    rendering: boolean;
    queuedPageNum: number | null;
    queuedFullscreen: boolean | null;
  }>({ rendering: false, queuedPageNum: null, queuedFullscreen: null });
  const pdfDocRef = useRef<any>(null);

  // Keyboard nudging for selected field
  useEffect(() => {
    if (!selectedFieldId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't nudge if user is typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); // prevent scrolling
        
        // 0.1% for precision, hold Shift for 1% jumps
        const nudgeAmount = e.shiftKey ? 1 : 0.1; 

        setPlacedFields(prev => prev.map(f => {
          if (f.id !== selectedFieldId) return f;

          let newX = f.x;
          let newY = f.y;

          switch (e.key) {
            case "ArrowUp": newY = Math.max(0, f.y - nudgeAmount); break;
            case "ArrowDown": newY = Math.min(95, f.y + nudgeAmount); break;
            case "ArrowLeft": newX = Math.max(0, f.x - nudgeAmount); break;
            case "ArrowRight": newX = Math.min(85, f.x + nudgeAmount); break;
          }

          return { ...f, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) };
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFieldId]);

  // Load PDF.js dynamically
  useEffect(() => {
    let active = true;

    async function loadPDF() {
      try {
        setPdfLoading(true);
        setPdfError(false);
        const pdfjs = await import("pdfjs-dist");
        
        // Use local worker file from public directory to bypass CDN and CORS issues
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({ url: template.pdf_path });
        const pdf = await loadingTask.promise;
        
        if (!active) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPdfLoading(false);

        // Render first page
        renderPage(1, isFullscreen);
      } catch (err) {
        console.error("PDF.js loading error:", err);
        if (active) {
          setPdfLoading(false);
          setPdfError(true);
        }
      }
    }

    loadPDF();
    return () => {
      active = false;
    };
  }, [template.pdf_path]);

  // Render a specific page of the PDF to the canvas
  const renderPage = async (pageNum: number, fullscreen?: boolean) => {
    const isFS = fullscreen !== undefined ? fullscreen : isFullscreen;

    // If a render is already in progress, queue this request
    if (renderStateRef.current.rendering) {
      renderStateRef.current.queuedPageNum = pageNum;
      renderStateRef.current.queuedFullscreen = isFS;
      return;
    }

    renderStateRef.current.rendering = true;

    try {
      if (!pdfDocRef.current || !canvasRef.current) {
        renderStateRef.current.rendering = false;
        return;
      }

      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        renderStateRef.current.rendering = false;
        return;
      }

      // Always render PDF at a crisp 1440px (2x retina for 720px base) so it stays sharp. 
      // The CSS width will scale it down, and 'cqi' will scale the fonts proportionally.
      const displayWidth = 1440;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = displayWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
    } catch (e: any) {
      if (e.name !== 'RenderingCancelledException') {
        console.error("Error rendering page:", e);
      }
    } finally {
      renderStateRef.current.rendering = false;

      // Execute queued render if one came in while we were rendering
      if (renderStateRef.current.queuedPageNum !== null) {
        const nextReqPage = renderStateRef.current.queuedPageNum;
        const nextReqFullscreen = renderStateRef.current.queuedFullscreen;
        
        renderStateRef.current.queuedPageNum = null;
        renderStateRef.current.queuedFullscreen = null;
        
        // Dispatch to next tick to ensure canvas is fully freed
        setTimeout(() => {
          renderPage(nextReqPage, nextReqFullscreen === null ? undefined : nextReqFullscreen);
        }, 0);
      }
    }
  };

  // Switch pages
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return;
    setCurrentPage(newPage);
    renderPage(newPage, isFullscreen);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const newFsState = !isFullscreen;
    setIsFullscreen(newFsState);
    renderPage(currentPage, newFsState);
  };

  // Add field to page
  const placeField = (fieldId: string, label: string) => {
    // Prevent placing duplicates
    if (placedFields.some(f => f.id === fieldId)) return;

    const newField: PlacedField = {
      id: fieldId,
      label,
      page: currentPage,
      x: 35, // Add at center (35% x)
      y: 40, // Add at center (40% y)
      fontSize: 10,
    };

    setPlacedFields(prev => [...prev, newField]);
    setSelectedFieldId(fieldId);
  };

  // Remove field
  const removeField = (fieldId: string) => {
    setPlacedFields(prev => prev.filter(f => f.id !== fieldId));
  };

  // Dragging states
  const dragStartRef = useRef<{
    fieldId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, fieldId: string, initialX: number, initialY: number) => {
    e.preventDefault();
    dragStartRef.current = {
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      initialX,
      initialY,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !containerRef.current) return;

    const { fieldId, startX, startY, initialX, initialY } = dragStartRef.current;
    const rect = containerRef.current.getBoundingClientRect();

    // Compute change in pixels
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Convert change to percentages
    const percentDeltaX = (deltaX / rect.width) * 100;
    const percentDeltaY = (deltaY / rect.height) * 100;

    // Calculate new position bounded between 0% and 90% (to stay on page)
    const newX = Math.max(0, Math.min(85, initialX + percentDeltaX));
    const newY = Math.max(0, Math.min(95, initialY + percentDeltaY));

    // Update positioned state
    setPlacedFields(prev => 
      prev.map(f => f.id === fieldId ? { ...f, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) } : f)
    );
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Touch Drag Handlers (for mobile devices)
  const handleTouchStart = (e: React.TouchEvent, fieldId: string, initialX: number, initialY: number) => {
    const touch = e.touches[0];
    dragStartRef.current = {
      fieldId,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX,
      initialY,
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragStartRef.current || !containerRef.current) return;
    
    // Prevent screen scroll while dragging
    e.preventDefault();

    const { fieldId, startX, startY, initialX, initialY } = dragStartRef.current;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    const percentDeltaX = (deltaX / rect.width) * 100;
    const percentDeltaY = (deltaY / rect.height) * 100;

    const newX = Math.max(0, Math.min(85, initialX + percentDeltaX));
    const newY = Math.max(0, Math.min(95, initialY + percentDeltaY));

    setPlacedFields(prev => 
      prev.map(f => f.id === fieldId ? { ...f, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) } : f)
    );
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  // Add a new custom field definition
  const handleAddCustomField = () => {
    const label = newFieldLabel.trim();
    if (!label) return;
    const id = `custom_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${Date.now()}`;
    const newDef: CustomFieldDef = { id, label };
    setCustomFields(prev => [...prev, newDef]);
    setNewFieldLabel("");
  };

  // Remove a custom field definition + any placed instance
  const handleRemoveCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
    setPlacedFields(prev => prev.filter(f => f.id !== id));
  };

  // Save Mappings to Database
  const handleSave = () => {
    setSaveStatus(null);
    
    // Convert array back to database format: { field_id: { page, x, y } }
    // Also persist _customFields metadata so custom fields survive a reload
    const mappings: Record<string, any> = {};
    placedFields.forEach(field => {
      mappings[field.id] = {
        page: field.page,
        x: field.x,
        y: field.y,
        fontSize: field.fontSize,
      };
    });
    // Embed custom field definitions into the mappings JSON
    mappings._customFields = customFields;

    startTransition(async () => {
      try {
        const result = await saveTemplateMappings(template.id, mappings);
        if (result.success) {
          setSaveStatus({ success: true, message: "Template mappings saved successfully!" });
          router.refresh();
        } else {
          setSaveStatus({ success: false, message: result.error || "Failed to save template mappings." });
        }
      } catch (err) {
        console.error("Save mappings error:", err);
        setSaveStatus({ success: false, message: "An unexpected error occurred." });
      }
    });
  };

  // Filter fields currently rendered on active page
  const activePageFields = placedFields.filter(f => f.page === currentPage);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 font-sans text-zinc-400 select-none selection:bg-indigo-500/30 overflow-hidden">

      {/* Generate Quotation Modal */}
      {showGenerateModal && (() => {
        // Build live mapping from current editor state (don't rely on DB state)
        const liveMappings: Record<string, { page: number; x: number; y: number }> = {};
        placedFields.forEach(field => {
          liveMappings[field.id] = { page: field.page, x: field.x, y: field.y };
        });
        return (
          <GenerateModal
            templateId={template.id}
            templateName={template.name}
            customFieldDefs={customFields}
            liveMappings={liveMappings}
            onClose={() => setShowGenerateModal(false)}
          />
        );
      })()}
      
      {/* Header bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950 py-2.5 px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-3 sm:gap-0 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/templates"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
              <span className="hidden sm:inline">Template Editor:</span> 
              <span className="font-medium text-zinc-400 truncate">{template.name}</span>
            </h1>
            <p className="text-[10px] text-zinc-500 truncate">Drag & drop variables onto your standard page grid</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
          {saveStatus && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              saveStatus.success 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "bg-red-500/10 text-red-400"
            }`}>
              {saveStatus.success ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">Save Layout</span>
            <span className="sm:hidden">Save</span>
          </button>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black shadow hover:bg-zinc-200 transition-colors"
          >
            <FileDown className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Generate Quotation</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>
      </header>

      {/* Editor Body Grid */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Left Side: Fields panel */}
        <aside className="order-2 lg:order-1 w-full lg:w-64 h-1/3 min-h-[250px] lg:h-auto lg:min-h-0 border-t lg:border-t-0 lg:border-r border-white/10 bg-zinc-950 overflow-y-auto p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Available Fields
              </h2>
              <p className="mt-1 text-[10px] text-zinc-500">Click a variables tag to overlay it onto your template canvas.</p>
            </div>

            <div className="space-y-2">
              {AVAILABLE_FIELDS.map((field) => {
                const isPlaced = placedFields.some(f => f.id === field.id);
                const placedOnActive = placedFields.find(f => f.id === field.id);

                return (
                  <button
                    key={field.id}
                    onClick={() => placeField(field.id, field.label)}
                    disabled={isPlaced}
                    className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                      isPlaced 
                        ? "bg-black/40 border-transparent text-zinc-600 cursor-not-allowed"
                        : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
                      {field.label}
                    </span>
                    {isPlaced && (
                      <span className="text-[9px] font-medium bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">
                        Pg {placedOnActive?.page}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Fields Section */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Custom Fields
              </h3>

              {/* Existing custom fields */}
              {customFields.length > 0 && (
                <div className="space-y-2 mb-3">
                  {customFields.map((field) => {
                    const isPlaced = placedFields.some(f => f.id === field.id);
                    const placedInfo = placedFields.find(f => f.id === field.id);
                    return (
                      <div key={field.id} className="flex items-center gap-1.5">
                        <button
                          onClick={() => placeField(field.id, field.label)}
                          disabled={isPlaced}
                          className={`flex-1 text-left flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                            isPlaced
                              ? "bg-indigo-500/5 border-transparent text-indigo-500/40 cursor-not-allowed"
                              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                            {field.label}
                          </span>
                          {isPlaced && (
                            <span className="text-[9px] font-medium bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-400">
                              Pg {placedInfo?.page}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/5 text-zinc-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors"
                          title="Delete custom field"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Create new custom field */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomField()}
                  placeholder="e.g. Validity Period"
                  className="flex-1 min-w-0 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-indigo-500 focus:bg-black focus:outline-none"
                />
                <button
                  onClick={handleAddCustomField}
                  disabled={!newFieldLabel.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 transition-colors"
                  title="Add custom field"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-zinc-500">Press Enter or click + to create</p>
            </div>

            {/* Selected Field Settings */}
            {selectedFieldId && (
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Text Settings
                  </h3>
                  <button 
                    onClick={() => setSelectedFieldId(null)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-zinc-300 flex justify-between">
                    <span>Font Size</span>
                    <span>{placedFields.find(f => f.id === selectedFieldId)?.fontSize || 10}px</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="48"
                    value={placedFields.find(f => f.id === selectedFieldId)?.fontSize || 10}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPlacedFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, fontSize: newSize } : f));
                    }}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Help Tip */}
          <div className="rounded-lg bg-white/5 border border-white/5 p-4 text-[10px] text-zinc-400 leading-relaxed">
            <div className="flex gap-1.5 items-center font-bold text-zinc-200 mb-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Canvas Guide</span>
            </div>
            1. Click tags to add them.<br/>
            2. Hold & drag variables to place them over text slots.<br/>
            3. Select a field and use <strong className="text-white">Arrow Keys</strong> to nudge. Hold <strong className="text-white">Shift</strong> for larger jumps.<br/>
          </div>
        </aside>

        {/* Center: PDF Canvas workspace */}
        <div 
          className={`order-1 lg:order-2 flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4 bg-zinc-950 transition-all ${
            isFullscreen ? "fixed inset-0 z-50 !py-6" : "relative"
          }`}
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        >
          
          {/* Contextual Floating Font Size Editor (Fullscreen) */}
          {selectedFieldId && isFullscreen && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-72 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Text Settings
                </h3>
                <button 
                  onClick={() => setSelectedFieldId(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-medium text-zinc-300 flex justify-between">
                  <span>Font Size</span>
                  <span>{placedFields.find(f => f.id === selectedFieldId)?.fontSize || 10}px</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="48"
                  value={placedFields.find(f => f.id === selectedFieldId)?.fontSize || 10}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPlacedFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, fontSize: newSize } : f));
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          )}
          
          {/* PDF Page Navigation & View Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-zinc-900/80 border border-white/10 px-4 py-2 rounded-lg backdrop-blur shadow-sm">
            {numPages > 1 && (
              <>
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-zinc-300">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === numPages}
                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
              </>
            )}

            <div className="flex items-center">
              <button
                onClick={toggleFullscreen}
                className="p-1.5 flex items-center gap-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  {isFullscreen ? "Exit" : "Enlarge"}
                </span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative shadow-2xl border border-white/10 bg-white rounded-none overflow-hidden">
            
            {/* Loading Indicator */}
            {pdfLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
                <p className="mt-3 text-xs font-semibold">Loading quotation PDF pages...</p>
              </div>
            )}

            {/* Render Canvas for PDF */}
            <canvas ref={canvasRef} className="block max-w-full" />

            {/* Fallback Container if PDF loading fails (or as grid mock) */}
            {pdfError && (
              <div className="w-[720px] h-[1018px] bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-center p-8 border border-zinc-200 dark:border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">PDF Render Error</h4>
                <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                  Could not parse this PDF file. Verify file permissions or path. Using default layout grid workspace.
                </p>
                
                {/* Fallback visual border to align variables in fallback mode */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>
              </div>
            )}

            {/* HTML Coordinate Mapping Overlay Container */}
            {!pdfLoading && (
              <div 
                ref={containerRef}
                className="absolute inset-0 bg-transparent select-none cursor-default overflow-hidden"
              >
                {activePageFields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      position: "absolute",
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      transform: "translateY(-100%)",
                      fontSize: `${field.fontSize || 10}px`,
                      lineHeight: 1,
                    }}
                    onMouseDown={(e) => {
                      setSelectedFieldId(field.id);
                      handleMouseDown(e, field.id, field.x, field.y);
                    }}
                    onTouchStart={(e) => {
                      setSelectedFieldId(field.id);
                      handleTouchStart(e, field.id, field.x, field.y);
                    }}
                    className={`flex items-end gap-1 px-1 py-0.5 border-b shadow-none cursor-grab active:cursor-grabbing group whitespace-nowrap transition-colors ${
                      selectedFieldId === field.id
                        ? "border-blue-500 bg-blue-50/80 text-blue-900 z-10"
                        : "border-zinc-400 border-dashed text-zinc-800 hover:border-zinc-900 z-0"
                    }`}
                  >
                    {field.id === "company_logo" ? (
                      <span className="font-bold opacity-80">[Logo: {field.label}]</span>
                    ) : field.id === "item_table" ? (
                      <span className="font-bold opacity-80">[Table: {field.label}]</span>
                    ) : (
                      <span className="font-medium">{field.label}</span>
                    )}
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                        if (selectedFieldId === field.id) setSelectedFieldId(null);
                      }}
                      className={`ml-1 flex h-[1.2em] w-[1.2em] shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors ${
                        selectedFieldId === field.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
