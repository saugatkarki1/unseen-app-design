"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, Play, RefreshCw } from "lucide-react"

interface CodePreviewProps {
    code: string
    language: string
    className?: string
}

// Languages that support live preview
const PREVIEW_LANGUAGES = ['html', 'css', 'javascript', 'jsx', 'tsx', 'typescript']

/**
 * Determines if a language supports live preview
 */
export function supportsPreview(language: string): boolean {
    return PREVIEW_LANGUAGES.includes(language.toLowerCase())
}

/**
 * CodePreview - Live preview component for code artifacts
 * 
 * Supports:
 * - HTML/CSS: Direct srcdoc iframe rendering
 * - JavaScript: Wrapped in HTML with console capture
 * - React/JSX/TSX: Client-side Babel transform + render
 */
export function CodePreview({ code, language, className }: CodePreviewProps) {
    const [error, setError] = useState<string | null>(null)
    const [previewKey, setPreviewKey] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // Debounced code for preview (prevents too many updates)
    const [debouncedCode, setDebouncedCode] = useState(code)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedCode(code)
            setError(null)
        }, 300)
        return () => clearTimeout(timer)
    }, [code])

    // Generate preview HTML based on language
    const previewHtml = useMemo(() => {
        const lang = language.toLowerCase()

        try {
            // HTML - render directly
            if (lang === 'html') {
                return wrapWithBaseStyles(debouncedCode)
            }

            // CSS - wrap in HTML with sample content
            if (lang === 'css') {
                return wrapWithBaseStyles(`
                    <style>${debouncedCode}</style>
                    <div class="preview-container">
                        <h1>Heading 1</h1>
                        <h2>Heading 2</h2>
                        <p>This is a paragraph of text.</p>
                        <button>Button</button>
                        <a href="#">Link</a>
                        <div class="box">Box element</div>
                    </div>
                `)
            }

            // JavaScript - wrap with console capture
            if (lang === 'javascript' || lang === 'js') {
                return wrapJavaScript(debouncedCode)
            }

            // TypeScript - for now, treat as JavaScript (no type checking)
            if (lang === 'typescript' || lang === 'ts') {
                // Strip basic type annotations for runtime
                const strippedCode = stripTypeAnnotations(debouncedCode)
                return wrapJavaScript(strippedCode)
            }

            // React/JSX/TSX - use Babel transform
            if (lang === 'jsx' || lang === 'tsx' || lang === 'react') {
                return wrapReact(debouncedCode)
            }

            return null
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Preview error')
            return null
        }
    }, [debouncedCode, language])

    // Force refresh preview
    const handleRefresh = () => {
        setPreviewKey(prev => prev + 1)
    }

    // Check if language supports preview
    if (!supportsPreview(language)) {
        return (
            <div className={cn(
                "flex items-center justify-center h-full bg-secondary/30 rounded-lg border border-border",
                className
            )}>
                <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        Preview not available for {language}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Preview Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Play className="h-3 w-3 text-success" />
                    <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Refresh preview"
                >
                    <RefreshCw className="h-3 w-3" />
                </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 relative bg-white rounded-b-lg overflow-hidden">
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/5 p-4">
                        <div className="text-center">
                            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                            <p className="text-xs text-destructive font-mono">{error}</p>
                        </div>
                    </div>
                ) : previewHtml ? (
                    <iframe
                        key={previewKey}
                        ref={iframeRef}
                        srcDoc={previewHtml}
                        title="Code Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                        onError={() => setError('Failed to render preview')}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Type some code to see preview</p>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Wrap content with base styles for consistent preview
 */
function wrapWithBaseStyles(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.5;
        }
        .preview-container { max-width: 100%; }
        .box { 
            padding: 16px; 
            border: 1px solid #e5e5e5; 
            border-radius: 8px; 
            margin-top: 16px;
        }
    </style>
</head>
<body>
${content}
</body>
</html>
`
}

/**
 * Wrap JavaScript with console capture
 */
function wrapJavaScript(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            margin: 0;
            padding: 12px;
            background: #1e1e1e;
            color: #d4d4d4;
            font-size: 13px;
            line-height: 1.6;
        }
        .log { color: #d4d4d4; }
        .warn { color: #ce9178; }
        .error { color: #f14c4c; }
        .info { color: #4ec9b0; }
    </style>
</head>
<body>
<div id="console"></div>
<script>
(function() {
    const consoleEl = document.getElementById('console');
    
    function appendLog(type, args) {
        const line = document.createElement('div');
        line.className = type;
        line.textContent = Array.from(args).map(arg => {
            if (typeof arg === 'object') {
                try { return JSON.stringify(arg, null, 2); } 
                catch { return String(arg); }
            }
            return String(arg);
        }).join(' ');
        consoleEl.appendChild(line);
    }
    
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };
    
    console.log = (...args) => { appendLog('log', args); originalConsole.log(...args); };
    console.warn = (...args) => { appendLog('warn', args); originalConsole.warn(...args); };
    console.error = (...args) => { appendLog('error', args); originalConsole.error(...args); };
    console.info = (...args) => { appendLog('info', args); originalConsole.info(...args); };
    
    try {
        ${code}
    } catch (e) {
        console.error('Error: ' + e.message);
    }
})();
</script>
</body>
</html>
`
}

/**
 * Wrap React/JSX code with Babel transform
 */
function wrapReact(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            background: #ffffff;
            color: #1a1a1a;
        }
        #root { }
        .error {
            color: #dc2626;
            background: #fef2f2;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
        }
    </style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
try {
    ${code}
    
    // Try to render common export patterns
    if (typeof App !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    } else if (typeof Component !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(<Component />);
    } else if (typeof Main !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
    }
} catch (e) {
    document.getElementById('root').innerHTML = '<div class="error">Error: ' + e.message + '</div>';
}
</script>
</body>
</html>
`
}

/**
 * Strip basic TypeScript type annotations for runtime
 * This is a simple implementation - not a full TS compiler
 */
function stripTypeAnnotations(code: string): string {
    return code
        // Remove type annotations after : (variable types)
        .replace(/:\s*[A-Za-z<>\[\]|&]+(\s*[=,\)])/g, '$1')
        // Remove generic type parameters
        .replace(/<[A-Za-z,\s]+>/g, '')
        // Remove 'as Type' assertions
        .replace(/\s+as\s+[A-Za-z<>\[\]|&]+/g, '')
        // Remove interface declarations
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        // Remove type declarations
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
}
