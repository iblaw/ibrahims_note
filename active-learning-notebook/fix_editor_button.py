import re

filepath = 'src/app/notes/new/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Copy Prompt UI with the AI Generation UI
# We need to find the specific block in the JSX.
# It looks like:
"""
        {/* Generative AI Tooling Header */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-800/50 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <p className="text-sm font-bold text-orange-900 dark:text-orange-200 text-center md:text-left leading-relaxed">
            Need the AI prompt template? Copy it here and paste it into ChatGPT or Gemini to generate your note!
          </p>
          <button
            onClick={handleCopyPrompt}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#403b38] border border-neutral-200 dark:border-neutral-600 rounded-full font-bold hover:bg-neutral-50 dark:hover:bg-[#4d4844] transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy Template"}
          </button>
        </div>
"""
# Actually, I don't know the exact text. Let's just find `handleCopyPrompt` and replace its parent div contents.
# Or better, just rewrite the whole `<div className="bg-gradient-to-r...` block.
# Let's search for `handleCopyPrompt` and replace it.

pattern = r'<div className="bg-gradient-to-r[^>]+>.*?handleCopyPrompt.*?</div>\s*</div>'
# wait, it's easier to find it dynamically.
