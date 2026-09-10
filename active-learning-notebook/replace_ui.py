import re

with open('src/app/notes/new/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 font-bold text-sm mb-4">
            AI Generation Error: {error.message || "Please ensure your Gemini API key is configured correctly in .env.local."}
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row gap-6 items-center justify-between">
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
        </div>"""

# Replace the block
content = re.sub(
    r'<div className="bg-neutral-100 dark:bg-\[#34302d\] p-6 rounded-2xl border border-neutral-200\s*dark:border-neutral-700 flex flex-col sm:flex-row gap-6 items-center justify-between">.*?Copy AI Prompt"\}\s*</button>\s*</div>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/app/notes/new/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
