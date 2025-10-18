'use client';

import { useState, useRef, useEffect } from 'react';
import { AdPreviewPanel } from './ad-preview-panel';
import { AdAgentChat } from './ad-agent-chat';
import { Button } from '@/components/ui/button';
import { GripHorizontal, Maximize2, Minimize2, Eye, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WizardSidebar({ className }: { className?: string }) {
  const [previewHeight, setPreviewHeight] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [activePanel, setActivePanel] = useState<'preview' | 'chat' | 'both'>('both');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - sidebarRect.top) / sidebarRect.height) * 100;

      // Constrain between 20% and 80%
      const constrainedHeight = Math.min(Math.max(newHeight, 20), 80);
      setPreviewHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Quick resize presets
  const setPreset = (preset: 'even' | 'preview' | 'chat') => {
    switch (preset) {
      case 'even':
        setPreviewHeight(50);
        break;
      case 'preview':
        setPreviewHeight(70);
        break;
      case 'chat':
        setPreviewHeight(30);
        break;
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'flex flex-col h-full border-l bg-background',
        isResizing && 'select-none',
        className
      )}
    >
      {/* Header with Panel Toggles */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant={activePanel === 'both' || activePanel === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'preview' ? 'both' : 'preview')}
            className="h-7"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Preview</span>
          </Button>
          <Button
            variant={activePanel === 'both' || activePanel === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel(activePanel === 'chat' ? 'both' : 'chat')}
            className="h-7"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">AI Agent</span>
          </Button>
        </div>

        {/* Preset Buttons */}
        {activePanel === 'both' && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPreset('preview')}
              title="More preview"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPreset('even')}
              title="Split evenly"
            >
              <GripHorizontal className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPreset('chat')}
              title="More chat"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activePanel === 'preview' && (
          <div className="h-full overflow-auto">
            <AdPreviewPanel />
          </div>
        )}

        {activePanel === 'chat' && (
          <div className="h-full">
            <AdAgentChat />
          </div>
        )}

        {activePanel === 'both' && (
          <>
            {/* Top Panel - Ad Preview */}
            <div
              className="overflow-auto"
              style={{ height: `${previewHeight}%` }}
            >
              <AdPreviewPanel />
            </div>

            {/* Resizer */}
            <div
              ref={resizerRef}
              className={cn(
                'relative h-1 bg-border hover:bg-primary/50 cursor-row-resize transition-colors group',
                isResizing && 'bg-primary'
              )}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  'w-12 h-1 rounded-full bg-muted-foreground/20 group-hover:bg-primary/50 transition-colors',
                  isResizing && 'bg-primary'
                )}>
                  <GripHorizontal className="h-3 w-3 mx-auto text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Bottom Panel - AI Agent */}
            <div
              className="overflow-hidden"
              style={{ height: `${100 - previewHeight}%` }}
            >
              <AdAgentChat />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
