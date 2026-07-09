"use client";

import { useState } from "react";
import { Menu, X, FileBox } from "lucide-react";
import { Button } from "./ui/button";

export default function MobileNav({ children, businessName }: { children: React.ReactNode, businessName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <FileBox size={20} />
          </div>
          Qotable
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white overflow-y-auto">
            <div className="absolute right-0 top-0 p-4">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </Button>
            </div>
            
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <FileBox size={20} />
                </div>
                Qotable
              </div>
            </div>
            
            <div className="px-6 py-4 flex flex-col items-start gap-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workspace</span>
              <span className="text-sm font-semibold truncate w-full">{businessName}</span>
            </div>

            {/* Injected navigation children */}
            <div className="flex-1 flex flex-col" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
