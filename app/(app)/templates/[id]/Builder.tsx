"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Type, GripVertical, Image as ImageIcon, Table as TableIcon, Hash, Save, Trash2, BoxSelect } from "lucide-react";

// --- Types ---
type ElementType = "text" | "variable" | "image" | "table" | "divider";

interface TemplateElement {
  id: string;
  type: ElementType;
  content: string;
  styles?: any;
}

const AVAILABLE_ELEMENTS = [
  { type: "text", label: "Text Block", icon: Type },
  { type: "variable", label: "Data Variable", icon: Hash },
  { type: "image", label: "Image / Logo", icon: ImageIcon },
  { type: "table", label: "Product Table", icon: TableIcon },
  { type: "divider", label: "Divider", icon: BoxSelect },
];

const AVAILABLE_VARIABLES = [
  { value: "business_name", label: "Business Name" },
  { value: "business_email", label: "Business Email" },
  { value: "business_phone", label: "Business Phone" },
  { value: "business_address", label: "Business Address" },
  { value: "business_tax_number", label: "Business Tax Number" },
  { value: "customer_name", label: "Customer Name" },
  { value: "customer_email", label: "Customer Email" },
  { value: "customer_phone", label: "Customer Phone" },
  { value: "customer_address", label: "Customer Address" },
  { value: "quotation_number", label: "Quotation Number" },
  { value: "quotation_date", label: "Quotation Date" },
  { value: "valid_until", label: "Valid Until Date" },
  { value: "subtotal", label: "Subtotal" },
  { value: "tax", label: "Total Tax" },
  { value: "discount", label: "Total Discount" },
  { value: "grand_total", label: "Grand Total" }
];

const MOCK_DATA: Record<string, string> = {
  business_name: "Helix Tech Ltd",
  business_email: "contact@helixtech.com",
  business_phone: "+91 9876543210",
  business_address: "123 Tech Park, Bangalore",
  business_tax_number: "GSTIN123456789",
  customer_name: "Jane Doe",
  customer_email: "jane@acmecorp.com",
  customer_phone: "+91 8765432109",
  customer_address: "456 Corporate Blvd, Mumbai",
  quotation_number: "QT-2026-001",
  quotation_date: new Date().toLocaleDateString(),
  valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  subtotal: "Rs. 25,000.00",
  tax: "Rs. 4,500.00",
  discount: "Rs. 0.00",
  grand_total: "Rs. 29,500.00"
};

function replaceVariables(text: string) {
  if (!text) return "";
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    return MOCK_DATA[variable.trim()] !== undefined ? MOCK_DATA[variable.trim()] : match;
  });
}

// --- Sortable Item Component ---
function SortableElement({ element, onSelect, selectedId, onDelete, previewMode }: { element: TemplateElement, onSelect: () => void, selectedId: string | null, onDelete: () => void, previewMode?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: element.id,
    disabled: previewMode 
  });

  const isSelected = selectedId === element.id && !previewMode;

  const getBoxMargins = (alignment: string | undefined) => {
    if (alignment === 'center') return { marginLeft: 'auto', marginRight: 'auto' };
    if (alignment === 'right') return { marginLeft: 'auto', marginRight: 0 };
    return { marginLeft: 0, marginRight: 0 };
  };

  const getVerticalAlignment = (alignment: string | undefined) => {
    if (alignment === 'middle') return 'center';
    if (alignment === 'bottom') return 'flex-end';
    return 'flex-start';
  };

  const getCssFontFamily = (pdfFont: string | undefined) => {
    if (pdfFont === "Times-Roman") return "serif";
    if (pdfFont === "Courier") return "monospace";
    return "sans-serif";
  };

  const layoutStyles = {
    width: element.styles?.width || '100%',
    height: element.styles?.height || 'auto',
    marginTop: element.styles?.marginTop !== undefined ? `${element.styles.marginTop}px` : undefined,
    marginBottom: element.styles?.marginBottom !== undefined ? `${element.styles.marginBottom}px` : '20px',
    ...getBoxMargins(element.styles?.boxAlignment as string)
  };

  const typographyStyles = {
    fontSize: element.styles?.fontSize,
    color: element.styles?.color,
    fontWeight: element.styles?.fontWeight,
    textAlign: element.styles?.textAlign as any,
    fontFamily: getCssFontFamily(element.styles?.fontFamily as string),
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        ...layoutStyles
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`group relative border-2 border-transparent transition-colors ${previewMode ? "" : "cursor-pointer"} ${
        isSelected ? "border-blue-500 bg-blue-50/30" : previewMode ? "" : "hover:border-slate-300 hover:bg-slate-50/50"
      }`}
    >
      {/* Drag Handle */}
      {!previewMode && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 bg-white border border-slate-200 rounded-md opacity-0 group-hover:opacity-100 cursor-grab hover:bg-slate-50 transition-opacity z-10"
        >
          <GripVertical size={14} className="text-slate-400" />
        </div>
      )}

      {/* Content */}
      <div 
        className={`w-full h-full overflow-hidden ${element.styles?.displayMode === 'block' ? 'block' : 'flex flex-col'}`} 
        style={{ 
          ...typographyStyles, 
          ...(element.styles?.displayMode !== 'block' ? { justifyContent: getVerticalAlignment(element.styles?.verticalAlignment as string) } : {}) 
        }}
      >
        {element.type === "text" && (
          <div className="whitespace-pre-wrap w-full">
            {previewMode ? replaceVariables(element.content) : (element.content || "Empty text block")}
          </div>
        )}
        {element.type === "variable" && (
          previewMode ? (
            <div className="whitespace-pre-wrap w-full">
              {element.styles?.prefix || ""}{MOCK_DATA[element.content] || `{{${element.content}}}`}{element.styles?.suffix || ""}
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-900 rounded inline-block">
              {element.styles?.prefix || ""}{AVAILABLE_VARIABLES.find(v => v.value === element.content)?.label || `[Variable: ${element.content}]`}{element.styles?.suffix || ""}
            </div>
          )
        )}
        {element.type === "image" && (
          <div className="bg-slate-100 rounded flex items-center justify-center border border-dashed border-slate-300 text-slate-400 w-full h-full min-h-[60px]">
            {previewMode ? "Logo" : "Image Placeholder"}
          </div>
        )}
        {element.type === "table" && (
          <div className="border border-solid rounded overflow-hidden w-full" style={{ borderColor: element.styles?.tableBorderColor || "#e2e8f0", borderWidth: `${element.styles?.tableBorderSize !== undefined ? element.styles.tableBorderSize : 1}px` }}>
            <div className="p-2 text-xs font-semibold flex" style={{ backgroundColor: element.styles?.tableHeaderBg || "#f1f5f9", color: element.styles?.tableHeaderTextColor || "#64748b" }}>
              <div className="w-[40%]">DESCRIPTION</div>
              <div className="w-[15%] text-center">QTY</div>
              <div className="w-[20%] text-right">UNIT PRICE</div>
              <div className="w-[25%] text-right">AMOUNT</div>
            </div>
            {previewMode ? (
              <>
                <div className="p-2 text-sm border-t border-solid flex" style={{ backgroundColor: element.styles?.tableRowBg || "#ffffff", color: element.styles?.tableRowTextColor || "#333333", borderColor: element.styles?.tableBorderColor || "#e2e8f0", borderTopWidth: `${element.styles?.tableBorderSize !== undefined ? element.styles.tableBorderSize : 1}px` }}>
                  <div className="w-[40%]">Premium Web Hosting (1 Year)</div>
                  <div className="w-[15%] text-center">1</div>
                  <div className="w-[20%] text-right">Rs. 25,000.00</div>
                  <div className="w-[25%] text-right">Rs. 25,000.00</div>
                </div>
                <div className="p-4 border-t border-solid flex flex-col items-end gap-1 text-sm" style={{ backgroundColor: element.styles?.tableRowBg || "#ffffff", color: element.styles?.tableRowTextColor || "#333333", borderColor: element.styles?.tableBorderColor || "#e2e8f0", borderTopWidth: `${element.styles?.tableBorderSize !== undefined ? element.styles.tableBorderSize : 1}px` }}>
                  <div className="flex w-[200px] justify-between"><span>SUBTOTAL</span><span>{MOCK_DATA.subtotal}</span></div>
                  <div className="flex w-[200px] justify-between"><span>TAX</span><span>{MOCK_DATA.tax}</span></div>
                  <div className="flex w-[200px] justify-between font-bold border-t border-solid pt-2 mt-1" style={{ borderColor: element.styles?.tableBorderColor || "#e2e8f0", borderTopWidth: `${element.styles?.tableBorderSize !== undefined ? element.styles.tableBorderSize : 1}px` }}><span>TOTAL DUE</span><span>{MOCK_DATA.grand_total}</span></div>
                </div>
              </>
            ) : (
              <div className="p-4 text-sm text-slate-400 text-center border-t border-solid" style={{ backgroundColor: element.styles?.tableRowBg || "#ffffff", borderColor: element.styles?.tableBorderColor || "#e2e8f0", borderTopWidth: `${element.styles?.tableBorderSize !== undefined ? element.styles.tableBorderSize : 1}px` }}>Table Data Placeholder</div>
            )}
          </div>
        )}
        {element.type === "divider" && (
          <div style={{ width: '100%', height: element.styles?.height || '2px', backgroundColor: element.styles?.color || '#e2e8f0', marginTop: '16px', marginBottom: '16px' }} />
        )}
      </div>

      {/* Delete Button */}
      {isSelected && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -right-3 -top-3 bg-red-500 text-white rounded-full p-1.5 shadow-sm z-20 hover:bg-red-600 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}


// --- Main Builder Component ---
export default function Builder({ 
  template,
  hideHeader,
  onUpdate
}: { 
  template: any;
  hideHeader?: boolean;
  onUpdate?: (data: any) => void;
}) {
  const [elements, setElements] = useState<TemplateElement[]>(template.canvas_data?.canvas_data?.elements || template.canvas_data?.elements || []);
  const [settings, setSettings] = useState<any>(template.canvas_data?.canvas_data?.settings || template.canvas_data?.settings || {});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (onUpdate) {
      onUpdate({ elements, settings });
    }
  }, [elements, settings]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const addElement = (type: ElementType) => {
    const newElement: TemplateElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === "text" ? "New Text Block" : type === "variable" ? "business_name" : "",
      styles: type === "text" 
        ? { fontSize: "16px", color: "#333", height: "70px" } 
        : type === "variable" 
        ? { fontSize: "16px", color: "#333" } 
        : {}
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateSelectedElement = (updates: Partial<TemplateElement>) => {
    setElements(elements.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("templates")
      .update({ canvas_data: { elements, settings } })
      .eq("id", template.id);
    
    setIsSaving(false);
    if (error) {
      alert("Error saving template: " + error.message);
      console.error(error);
    } else {
      alert("Template saved successfully!");
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const isLandscape = template.layout === "A4 Landscape";

  const getNumericValue = (val: any) => {
    if (val === undefined || val === null) return "";
    const parsed = parseInt(val);
    return isNaN(parsed) ? "" : parsed;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header Bar */}
      {!hideHeader && (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="font-semibold text-slate-800">{template.name || "Template Builder"}</h1>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => { setPreviewMode(false); setSelectedId(null); }} 
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${!previewMode ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Edit Design
              </button>
              <button 
                onClick={() => { setPreviewMode(true); setSelectedId(null); }} 
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${previewMode ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Preview Mock
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveTemplate} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Save size={16} className="mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Components */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200 font-semibold text-sm">Components</div>
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {AVAILABLE_ELEMENTS.map(el => (
              <button
                key={el.type}
                onClick={() => addElement(el.type as ElementType)}
                className="flex items-center gap-3 w-full p-3 text-left border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors bg-white group"
              >
                <div className="text-slate-400 group-hover:text-blue-500">
                  <el.icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700">{el.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div 
            className="bg-white shadow-sm border border-slate-200 rounded-sm relative bg-no-repeat bg-cover bg-center"
            style={{ 
              width: isLandscape ? "297mm" : "210mm", 
              minHeight: isLandscape ? "210mm" : "297mm",
              padding: "20mm",
              backgroundImage: settings?.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
              backgroundColor: settings?.backgroundColor || "#FFFFFF"
            }}
            onClick={() => setSelectedId(null)}
          >
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium">
                Click elements on the left to add them to the canvas.
              </div>
            )}
            <DndContext 
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-wrap content-start">
                  {elements.flatMap(el => {
                    const result = [];
                    if (el.styles?.forceNewLine) {
                      result.push(<div key={`break-${el.id}`} className="w-full basis-full h-0 m-0 p-0 pointer-events-none" />);
                    }
                    result.push(
                      <SortableElement 
                        key={el.id} 
                        element={el} 
                        selectedId={selectedId}
                        onSelect={() => !previewMode && setSelectedId(el.id)}
                        onDelete={() => deleteElement(el.id)}
                        previewMode={previewMode}
                      />
                    );
                    return result;
                  })}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId ? (
                  <div className="p-4 border-2 border-blue-500 bg-white rounded-lg shadow-xl opacity-80">
                    Dragging element...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200 font-semibold text-sm">Properties</div>
          <div className="p-6 overflow-y-auto flex-1">
            {!selectedElement ? (
              <div className="space-y-6">
                <div className="text-center text-slate-400 text-sm mb-8 pb-8 border-b border-slate-100">
                  Select an element on the canvas to edit its properties.
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wider mb-4 block">Page Settings</Label>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={settings?.backgroundColor || "#FFFFFF"}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                        className="h-10 w-14 p-1 cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={settings?.backgroundColor || "#FFFFFF"}
                        onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                        className="flex-1 uppercase font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Element Type</Label>
                  <div className="font-medium capitalize">{selectedElement.type}</div>
                </div>

                {(selectedElement.type === "divider") && (
                  <div className="space-y-2">
                    <Label>Divider Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={selectedElement.styles?.color || "#e2e8f0"}
                        onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, color: e.target.value }})}
                        className="h-10 w-14 p-1 cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={selectedElement.styles?.color || "#e2e8f0"}
                        onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, color: e.target.value }})}
                        className="flex-1 uppercase font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {(selectedElement.type === "table") && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Header Background Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={selectedElement.styles?.tableHeaderBg || "#f1f5f9"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableHeaderBg: e.target.value }})} className="h-10 w-14 p-1 cursor-pointer" />
                        <Input type="text" value={selectedElement.styles?.tableHeaderBg || "#f1f5f9"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableHeaderBg: e.target.value }})} className="flex-1 uppercase font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Header Text Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={selectedElement.styles?.tableHeaderTextColor || "#64748b"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableHeaderTextColor: e.target.value }})} className="h-10 w-14 p-1 cursor-pointer" />
                        <Input type="text" value={selectedElement.styles?.tableHeaderTextColor || "#64748b"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableHeaderTextColor: e.target.value }})} className="flex-1 uppercase font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Row Background</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={selectedElement.styles?.tableRowBg || "#ffffff"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableRowBg: e.target.value }})} className="h-10 w-14 p-1 cursor-pointer" />
                        <Input type="text" value={selectedElement.styles?.tableRowBg || "#ffffff"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableRowBg: e.target.value }})} className="flex-1 uppercase font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Row Text Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={selectedElement.styles?.tableRowTextColor || "#333333"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableRowTextColor: e.target.value }})} className="h-10 w-14 p-1 cursor-pointer" />
                        <Input type="text" value={selectedElement.styles?.tableRowTextColor || "#333333"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableRowTextColor: e.target.value }})} className="flex-1 uppercase font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Border Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={selectedElement.styles?.tableBorderColor || "#e2e8f0"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableBorderColor: e.target.value }})} className="h-10 w-14 p-1 cursor-pointer" />
                        <Input type="text" value={selectedElement.styles?.tableBorderColor || "#e2e8f0"} onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableBorderColor: e.target.value }})} className="flex-1 uppercase font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Border Size (px)</Label>
                      <Input 
                        type="number" 
                        placeholder="1"
                        value={selectedElement.styles?.tableBorderSize ?? 1}
                        onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, tableBorderSize: e.target.value === "" ? undefined : Number(e.target.value) }})}
                        className="h-10" 
                      />
                    </div>
                  </div>
                )}

                {(selectedElement.type === "text" || selectedElement.type === "variable") && (
                  <div className="space-y-2">
                    <Label>Content</Label>
                  {selectedElement.type === "text" ? (
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={selectedElement.content}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    />
                  ) : (
                    <select
                      value={selectedElement.content}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Select a variable</option>
                      {AVAILABLE_VARIABLES.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {(selectedElement.type === "text" || selectedElement.type === "variable") && (
                <>
                  {selectedElement.type === "variable" && (
                    <>
                      <div className="space-y-2">
                        <Label>Prefix Label (Optional)</Label>
                        <textarea 
                          placeholder="e.g. Date:\n" 
                          value={selectedElement.styles?.prefix || ""}
                          onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, prefix: e.target.value }})}
                          className="w-full min-h-[60px] p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Suffix Label (Optional)</Label>
                        <textarea 
                          placeholder="e.g.\nUSD" 
                          value={selectedElement.styles?.suffix || ""}
                          onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, suffix: e.target.value }})}
                          className="w-full min-h-[60px] p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                      value={selectedElement.styles?.fontFamily || "Helvetica"}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, fontFamily: e.target.value }})}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Helvetica">Helvetica (Clean & Modern)</option>
                      <option value="Times-Roman">Times Roman (Classic Serif)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size (px)</Label>
                    <Input 
                      type="number" 
                      value={getNumericValue(selectedElement.styles?.fontSize)}
                      placeholder="16"
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, fontSize: e.target.value === "" ? undefined : `${e.target.value}px` }})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input 
                      type="color" 
                      value={selectedElement.styles?.color || "#333333"}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, color: e.target.value }})}
                      className="h-10 p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <select
                      value={selectedElement.styles?.fontWeight || "normal"}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, fontWeight: e.target.value }})}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map(align => (
                        <Button 
                          key={align}
                          type="button"
                          variant={selectedElement.styles?.textAlign === align ? "default" : "outline"}
                          size="sm"
                          className="flex-1 capitalize"
                          onClick={() => updateSelectedElement({ styles: { ...selectedElement.styles, textAlign: align as any }})}
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <Label className="text-xs text-slate-500 uppercase tracking-wider block">Layout Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Width (Layout)</Label>
                    <select
                      value={selectedElement.styles?.width || "100%"}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, width: e.target.value }})}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="100%">Full Width (100%)</option>
                      <option value="50%">Half Width (50%)</option>
                      <option value="33.33%">One Third (33%)</option>
                      <option value="25%">One Quarter (25%)</option>
                      <option value="auto">Fit Content (Auto)</option>
                    </select>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label className="text-xs">Margin Top (px)</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={getNumericValue(selectedElement.styles?.marginTop)}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, marginTop: e.target.value === "" ? undefined : e.target.value }})}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label className="text-xs">Margin Bottom (px)</Label>
                    <Input 
                      type="number"
                      placeholder="20"
                      value={getNumericValue(selectedElement.styles?.marginBottom)}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, marginBottom: e.target.value === "" ? undefined : e.target.value }})}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 mt-2">
                    <Label className="text-xs">Height (px)</Label>
                    <Input 
                      type="number"
                      placeholder="Auto"
                      value={getNumericValue(selectedElement.styles?.height)}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, height: e.target.value === "" ? undefined : `${e.target.value}px` }})}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 mt-2">
                    <Label className="text-xs">Box Position (Horizontal)</Label>
                    <div className="flex gap-2">
                      {["left", "center", "right"].map(align => (
                        <Button 
                          key={`box-${align}`}
                          type="button"
                          variant={(selectedElement.styles?.boxAlignment || "left") === align ? "default" : "outline"}
                          size="sm"
                          className="flex-1 capitalize"
                          onClick={() => updateSelectedElement({ styles: { ...selectedElement.styles, boxAlignment: align }})}
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 mt-2">
                    <Label className="text-xs">Display Mode</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant={(selectedElement.styles?.displayMode || "flex") === "flex" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => updateSelectedElement({ styles: { ...selectedElement.styles, displayMode: "flex" }})}
                      >
                        Flex (Auto Align)
                      </Button>
                      <Button 
                        type="button"
                        variant={selectedElement.styles?.displayMode === "block" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => updateSelectedElement({ styles: { ...selectedElement.styles, displayMode: "block" }})}
                      >
                        Standard Block
                      </Button>
                    </div>
                  </div>
                  {(selectedElement.styles?.displayMode || "flex") === "flex" && (
                    <div className="space-y-2 col-span-2 mt-2">
                      <Label className="text-xs">Content Alignment (Vertical)</Label>
                      <div className="flex gap-2">
                        {["top", "middle", "bottom"].map(align => (
                          <Button 
                            key={`vert-${align}`}
                            type="button"
                            variant={(selectedElement.styles?.verticalAlignment || "top") === align ? "default" : "outline"}
                            size="sm"
                            className="flex-1 capitalize"
                            onClick={() => updateSelectedElement({ styles: { ...selectedElement.styles, verticalAlignment: align }})}
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2 flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    <input 
                      type="checkbox" 
                      id="forceNewLine"
                      checked={selectedElement.styles?.forceNewLine || false}
                      onChange={(e) => updateSelectedElement({ styles: { ...selectedElement.styles, forceNewLine: e.target.checked }})}
                      className="rounded border-slate-300 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="forceNewLine" className="text-sm cursor-pointer">Force Start on New Line</Label>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-2">
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl" 
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Element
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
