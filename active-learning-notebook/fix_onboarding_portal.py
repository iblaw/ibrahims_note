import re

with open('src/components/OnboardingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ModalPortal import
if 'import ModalPortal' not in content:
    content = re.sub(r'import \{ supabase \} from "@/lib/supabase";', r'import { supabase } from "@/lib/supabase";\nimport ModalPortal from "@/components/ModalPortal";', content)

# Replace all `<div className="fixed inset-0...` with `<ModalPortal><div className="fixed inset-0...`
# But actually if we use ModalPortal, the div should just be `<div className="absolute inset-0...` because ModalPortal already handles `fixed inset-0`.
# ModalPortal renders: `<div className="fixed inset-0 z-[100]">{children}</div>`
# So the inner div can just be `<div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4">`

content = re.sub(
    r'<div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">',
    r'<ModalPortal>\n      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4">',
    content
)

# And we need to add `</ModalPortal>` for each `</div>` that closes that wrapper.
# Since it's a huge component with multiple returns, it's safer to just wrap the ENTIRE return statement if we can, or just replace `);` with `</ModalPortal>);` for the outermost elements.
# Wait, let's just do a simpler replacement: wrap the whole `if (step === X) return (...)` block.

