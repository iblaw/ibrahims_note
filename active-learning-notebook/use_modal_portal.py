import re

with open('src/components/TopicStudyModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the previously injected createPortal logic
content = re.sub(r'import \{ createPortal \} from "react-dom";\n', '', content)
content = re.sub(r'  const \[mounted, setMounted\] = useState\(false\);\n  useEffect\(\(\) => setMounted\(true\), \[\]\);\n', '', content)

# Replace the manual createPortal block
# From: `if (!mounted) return null;\n  return createPortal(\n    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-\[100\] flex items-center justify-center p-4">`
# To: `return (\n    <ModalPortal>\n      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">`

content = re.sub(
    r'if \(!mounted\) return null;\n\s*return createPortal\(\n\s*<div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-\[100\] flex items-center justify-center p-4">',
    r'return (\n    <ModalPortal>\n      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">',
    content
)

# And replace `), document.body);` with `</ModalPortal>\n  );`
content = re.sub(r'\), document\.body\);\n\}', r'    </ModalPortal>\n  );\n}', content)

# Add ModalPortal import
if 'import ModalPortal from' not in content:
    content = re.sub(r'import Link from "next/link";', r'import Link from "next/link";\nimport ModalPortal from "@/components/ModalPortal";', content)

with open('src/components/TopicStudyModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

