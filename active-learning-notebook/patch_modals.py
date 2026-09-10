import re
import glob

def wrap_with_portal(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already uses createPortal
    if 'createPortal' in content:
        return

    # Add imports
    content = content.replace('import { useState', 'import { useState, useEffect }').replace('useEffect, useEffect', 'useEffect')
    
    if 'import { createPortal } from "react-dom";' not in content:
        content = re.sub(r'import .+ from "react";\n', r'\g<0>import { createPortal } from "react-dom";\n', content)
        if 'createPortal' not in content: # fallback
            content = 'import { createPortal } from "react-dom";\n' + content

    # Find the main return statement.
    # Usually it's `return (\n    <div className="fixed` or `return (\n    <div className="fixed inset-0`
    
    # We will inject the mounted state hook inside the component.
    # Find `export default function ComponentName(...) {`
    match = re.search(r'export default function [A-Za-z0-9_]+\(.*\) \{', content)
    if match:
        insertion_point = match.end()
        mounted_hook = "\n  const [mounted, setMounted] = useState(false);\n  useEffect(() => setMounted(true), []);\n"
        # don't inject twice
        if 'const [mounted, setMounted]' not in content:
            content = content[:insertion_point] + mounted_hook + content[insertion_point:]

    # Replace the return block.
    # We will find `return (` and replace it, but we only want to wrap the outermost div.
    # A safer way is to just look for `return (` and replace the closing `);` 
    # But some components have early returns.
    # Let's use a regex to find `return (\n    <div className="fixed inset-0`
    
    pattern = r'(return\s*\(\s*)(<div className="fixed inset-0)'
    replacement = r'if (!mounted) return null;\n  \1createPortal(\n    \2'
    
    content, count = re.subn(pattern, replacement, content)
    
    if count > 0:
        # replace the last `);` with `), document.body);`
        # Since these files end with `);\n}`, we can safely replace `);\n}` with `), document.body);\n}`
        content = re.sub(r'\);\n\}', r'), document.body);\n}', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"Could not patch {filepath}")

wrap_with_portal('src/components/TopicStudyModal.tsx')
wrap_with_portal('src/components/EditScheduleModal.tsx')
wrap_with_portal('src/components/CreateScheduleModal.tsx')

