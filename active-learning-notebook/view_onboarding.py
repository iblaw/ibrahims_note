import re

with open('src/components/OnboardingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

steps = re.findall(r'if \(step === \d\).*?(?:return \().*?\);', content, re.DOTALL)
for i, step in enumerate(steps):
    title = re.search(r'<h[23][^>]*>(.*?)</h[23]>', step)
    if title:
        print(f"Step {i+1}: {title.group(1)}")
    else:
        print(f"Step {i+1}: No title found")
