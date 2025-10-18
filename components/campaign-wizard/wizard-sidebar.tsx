'use client';

import { useState, useRef, useEffect } from 'react';
import { AdPreviewPanel } from './ad-preview-panel';
import { AdAgentChat } from './ad-agent-chat';
import { Button } from '@/components/ui/button';
import { GripHorizontal, Maximize2, Minimize2, Eye, MessageSquare, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WizardSidebar({ className }: { className?: string }) {
  const [previewHeight, setPreviewHeight] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [activePanel, setActivePanel] = useState<'preview' | 'chat' | 'both'>('both');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400); // Default width in pixels
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const widthResizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleWidthMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingWidth(true);
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

  useEffect(() => {
    const handleWidthMouseMove = (e: MouseEvent) => {
      if (!isResizingWidth) return;

      // Calculate new width based on distance from right edge of viewport
      const newWidth = window.innerWidth - e.clientX;

      // Constrain between 300px and 800px
      const constrainedWidth = Math.min(Math.max(newWidth, 300), 800);
      setSidebarWidth(constrainedWidth);
    };

    const handleWidthMouseUp = () => {
      setIsResizingWidth(false);
    };

    if (isResizingWidth) {
      document.addEventListener('mousemove', handleWidthMouseMove);
      document.addEventListener('mouseup', handleWidthMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleWidthMouseMove);
      document.removeEventListener('mouseup', handleWidthMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingWidth]);

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
    <>
      {/* Floating Collapse/Expand Button */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 z-50 h-10 w-10 rounded-full shadow-lg border-2"
          onClick={() => setIsCollapsed(false)}
          title="Show sidebar"
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>
      )}

      {/* Width Resizer - Prominent Draggable Divider */}
      {!isCollapsed && (
        <div
          ref={widthResizerRef}
          className={cn(
            'absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-50 transition-all duration-200 group',
            isResizingWidth ? 'bg-primary/80' : 'bg-border/60 hover:bg-primary/60'
          )}
          onMouseDown={handleWidthMouseDown}
          style={{
            marginLeft: '-4px', // Position it to overlap the border
          }}
        >
          {/* Wider hover area for easier grabbing - now visible with background */}
          <div
            className={cn(
              'absolute inset-y-0 -left-4 -right-4 transition-colors',
              isResizingWidth
                ? 'bg-primary/10'
                : 'bg-transparent group-hover:bg-primary/5'
            )}
          />

          {/* Visual grip indicator - always visible and prominent */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-20 rounded-full transition-all duration-200 shadow-sm',
              isResizingWidth
                ? 'bg-primary shadow-lg h-24 w-2'
                : 'bg-muted-foreground/60 group-hover:bg-primary group-hover:h-24 group-hover:w-2'
            )}
          />
        </div>
      )}

      <div
        ref={sidebarRef}
        className={cn(
          'flex flex-col h-full border-l bg-background transition-all duration-300 relative overflow-hidden',
          (isResizing || isResizingWidth) && 'select-none',
          isCollapsed && 'translate-x-full',
          className
        )}
        style={{ width: isCollapsed ? 0 : `${sidebarWidth}px`, minWidth: isCollapsed ? 0 : `${sidebarWidth}px` }}
      >
        {/* Header with Panel Toggles */}
        <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-1">
            <Button
              variant={activePanel === 'preview' || (activePanel === 'both') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                if (activePanel === 'preview') {
                  setActivePanel('both');
                } else if (activePanel === 'both') {
                  setActivePanel('chat');
                } else {
                  setActivePanel('preview');
                }
              }}
              className="h-7"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Preview</span>
            </Button>
            <Button
              variant={activePanel === 'chat' || (activePanel === 'both') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                if (activePanel === 'chat') {
                  setActivePanel('both');
                } else if (activePanel === 'both') {
                  setActivePanel('preview');
                } else {
                  setActivePanel('chat');
                }
              }}
              className="h-7"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">AI Agent</span>
            </Button>
          </div>

          {/* Preset & Collapse Buttons */}
          <div className="flex items-center gap-1">
            {activePanel === 'both' && (
              <>
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
              </>
            )}
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(true)}
              title="Hide sidebar"
            >
              <PanelRightClose className="h-3 w-3" />
            </Button>
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activePanel === 'preview' && (
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <AdPreviewPanel />
          </div>
        )}

        {activePanel === 'chat' && (
          <div className="h-full overflow-x-hidden">
            <AdAgentChat />
          </div>
        )}

        {activePanel === 'both' && (
          <>
            {/* Top Panel - Ad Preview */}
            <div
              className="overflow-y-auto overflow-x-hidden"
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
              className="overflow-x-hidden"
              style={{ height: `${100 - previewHeight}%` }}
            >
              <AdAgentChat />
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
