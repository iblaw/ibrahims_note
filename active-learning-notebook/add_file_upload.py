import re

with open('src/app/notes/new/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add FileText and Upload to lucide-react imports
content = re.sub(
    r'import \{ Sparkles, Loader2, Copy, Check, Link as LinkIcon, Smartphone, Monitor, X, Search \} from "lucide-react";',
    r'import { Sparkles, Loader2, Copy, Check, Link as LinkIcon, Smartphone, Monitor, X, Search, Upload, FileText } from "lucide-react";',
    content
)

# 2. Add classContext state
content = re.sub(
    r'const \[useBasicEditor, setUseBasicEditor\] = useState\(false\);',
    r'const [useBasicEditor, setUseBasicEditor] = useState(false);\n  const [classContext, setClassContext] = useState("");',
    content
)

# 3. Add context handling in getDynamicPrompt
prompt_injection = """
    let contextInstruction = "";
    if (classContext.trim()) {
      contextInstruction = `\\n\\n*** USER'S CLASS NOTES / CONTEXT ***\\nThe user provided the following raw class notes/context for this topic:\\n\\"\\"\\"\\n${classContext}\\n\\"\\"\\"\\nCRITICAL: You MUST integrate this specific information, emphasize the points they highlighted, and ensure your generated note directly addresses their uploaded context.`;
    }

    return `Context: You are an expert instructional designer and AI tutor. Your task is to generate a Note Document for a specialized Active Learning platform.${personaInstruction}${topicInstruction}${contextInstruction}
"""
content = re.sub(
    r'return `Context: You are an expert instructional designer and AI tutor\. Your task is to generate a Note Document for a specialized Active Learning platform\.\$\{personaInstruction\}\$\{topicInstruction\}',
    prompt_injection,
    content
)

# 4. Replace Lumen AI Generation UI block
ui_block = """          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-blue-900 dark:text-blue-300 mb-1">Lumen AI Generation</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  Automatically generate a comprehensive note based on your learning style.
                </p>
              </div>
              <button
                onClick={() => isGenerating ? stop() : complete(getDynamicPrompt()).catch(err => console.error(err))}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? "Stop Generation" : "Generate with AI"}
              </button>
            </div>
            
            <div className="mt-2 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
              <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center justify-between">
                <span>Class Notes & Additional Context (Optional)</span>
                <label className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#34302d] hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
                  <Upload size={14} />
                  Upload File
                  <input 
                    type="file" 
                    accept=".txt,.md,.csv,.rtf" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const text = e.target?.result as string;
                        setClassContext(prev => prev ? prev + "\\n\\n" + text : text);
                      };
                      reader.readAsText(file);
                    }} 
                  />
                </label>
              </label>
              <textarea
                value={classContext}
                onChange={(e) => setClassContext(e.target.value)}
                placeholder="Paste your syllabus, professor's slides text, or specific concepts you want Lumen to focus on..."
                className="w-full p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-white/70 dark:bg-[#2a2624]/70 text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:border-transparent transition-all resize-none h-24 text-sm"
              />
            </div>
          </div>"""

content = re.sub(
    r'<div className="bg-gradient-to-r from-blue-50 to-indigo-50.*?</div>\s*</div>\s*<div className="space-y-6">',
    ui_block + '\n\n        <div className="space-y-6">',
    content,
    flags=re.DOTALL
)

with open('src/app/notes/new/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
