import React, { type ReactNode } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface SplitViewProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    showRightPanel: boolean;
    isFullscreen?: boolean; // Right side fullscreen
    isLeftFullscreen?: boolean; // Left side fullscreen
    title?: ReactNode; // Right side title
    leftTitle?: ReactNode; // Left side title
    onClose?: () => void;
    onToggleFullscreen?: () => void; // Right side toggle
    onToggleLeftFullscreen?: () => void; // Left side toggle
    leftPanelWidth?: string;
    rightPanelWidth?: string;
}

export const SplitView: React.FC<SplitViewProps> = ({ 
    leftPanel, 
    rightPanel, 
    showRightPanel,
    isFullscreen = false,
    isLeftFullscreen = false,
    title,
    leftTitle,
    onClose,
    onToggleFullscreen,
    onToggleLeftFullscreen,
    leftPanelWidth,
    rightPanelWidth = '60%'
}) => {
    // Determine the actual widths to use
    const effectiveRightWidth = rightPanelWidth;
    const effectiveLeftWidth = leftPanelWidth || `calc(100% - ${effectiveRightWidth})`;

    // Logic:
    // If Right Fullscreen -> Left is hidden, Right is 100% (absolute inset)
    // If Left Fullscreen -> Right is hidden, Left is 100%
    const shouldHideRight = !showRightPanel || isLeftFullscreen;
    const shouldHideLeft = isFullscreen && showRightPanel;

    return (
        <div className={`
            flex-1 flex overflow-hidden transition-all duration-300
            ${(isFullscreen || isLeftFullscreen) ? 'absolute inset-0 z-50 bg-background' : 'relative'}
        `}>
            {/* Left Panel */}
            <div 
                className={`
                    flex flex-col transition-all duration-300 bg-transparent
                    ${shouldHideLeft ? 'hidden' : 'flex'} 
                    border-r border-border-strong/30
                `}
                style={{ width: isLeftFullscreen ? '100%' : (shouldHideRight ? '100%' : effectiveLeftWidth) }}
            >
                {/* Left Header - Only rendered if title or toggle provided */}
                {(leftTitle || onToggleLeftFullscreen) && (
                    <div className="p-4 border-b border-border-strong/30 flex items-center justify-between bg-white/5 shrink-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {typeof leftTitle === 'string' ? (
                                <h2 className="text-xs font-black uppercase tracking-widest text-foreground truncate">
                                    {leftTitle}
                                </h2>
                            ) : (
                                leftTitle
                            )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                            {onToggleLeftFullscreen && (
                                <button
                                    onClick={onToggleLeftFullscreen}
                                    className="p-2 hover:bg-white/5 rounded-lg text-foreground/100 hover:text-foreground transition-colors"
                                    title={isLeftFullscreen ? "Restaurar visão dividida" : "Expandir lista"}
                                >
                                    {isLeftFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {leftPanel}
                </div>
            </div>

            {/* Right Panel */}
            {!shouldHideRight && (
                <div 
                    className={`
                        flex flex-col bg-transparent border-l border-border-strong/30 transition-all duration-300
                        ${isFullscreen ? 'shadow-none border-none' : 'relative overflow-hidden'}
                    `}
                    style={{ width: isFullscreen ? '100%' : effectiveRightWidth }}
                >
                    {/* Universal Header for Right Panel */}
                    {(title || onToggleFullscreen || onClose) && (
                        <div className="p-4 border-b border-border-strong/30 flex items-center justify-between bg-white/5 shrink-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {typeof title === 'string' ? (
                                    <h2 className="text-xs font-black uppercase tracking-widest text-foreground truncate">
                                        {title}
                                    </h2>
                                ) : (
                                    title
                                )}
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                {onToggleFullscreen && (
                                    <button
                                        onClick={onToggleFullscreen}
                                        className="p-2 hover:bg-white/5 rounded-lg text-foreground/100 hover:text-foreground"
                                        title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                                    >
                                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    </button>
                                )}
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/5 rounded-lg text-foreground/100 hover:text-foreground"
                                        title="Fechar detalhes"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                        {rightPanel}
                    </div>
                </div>
            )}
        </div>
    );
};
