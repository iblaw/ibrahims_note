import re

filepath = 'src/app/notes/new/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useCompletion import
if 'useCompletion' not in content:
    content = re.sub(r'import { useState, useEffect } from "react";', r'import { useState, useEffect } from "react";\nimport { useCompletion } from "ai/react";', content)

# Find the start of the CreateNote component to inject hooks
match = re.search(r'export default function CreateNote\(\) \{', content)
if match:
    injection_point = match.end()
    hooks = """
  const { complete, completion, isLoading: isGenerating, stop } = useCompletion({ 
    api: "/api/generate-note",
    onFinish: (prompt, result) => {
      setContent(result);
    }
  });

  useEffect(() => {
    if (completion) {
      setContent(completion);
    }
  }, [completion]);
"""
    if 'const { complete' not in content:
        content = content[:injection_point] + hooks + content[injection_point:]

# Find the useEffect that handles the initial load to trigger generation
# We need to trigger generation if `generate=true` is in the URL.
# However, we need `getDynamicPrompt()` which requires `profile` and `selectedTopics`.
# Since profile is fetched async, it's better to wait until `profile` is loaded.

# Let's add a separate useEffect for auto-generation
auto_gen_effect = """
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const generateParam = searchParams.get('generate');
    
    // Only auto-generate if generate=true, profile is loaded, and we haven't started yet
    if (generateParam === 'true' && profile && !isGenerating && !content) {
      // Small timeout to ensure states (like selectedTopics) are fully applied
      setTimeout(() => {
        complete(getDynamicPrompt());
        // Remove generate=true from URL so it doesn't trigger again on reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('generate');
        window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
      }, 500);
    }
  }, [profile, complete]);
"""
if 'const generateParam = searchParams.get(\'generate\');' not in content:
    content = re.sub(r'const fetchProfile = async \(\) =>', auto_gen_effect + '\n  const fetchProfile = async () =>', content)

# Change the "Copy Prompt" button into "Generate with AI" button if they want to do it manually
content = re.sub(
    r'<button\s*onClick=\{handleCopyPrompt\}\s*className="flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-bold transition-all"\s*>\s*<Sparkles size=\{20\} \/>\s*\{copied \? "Copied!" : "Copy AI Prompt"\}\s*</button>',
    r'''<button 
            onClick={() => isGenerating ? stop() : complete(getDynamicPrompt())}
            className="flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-bold transition-all"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? "Stop Generation" : "Generate with AI"}
          </button>''',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
