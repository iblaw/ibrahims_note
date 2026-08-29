"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Quiz from "./Quiz";
import FeynmanPrompt from "./FeynmanPrompt";
import Flashcard from "./Flashcard";

const components = {
  Quiz,
  FeynmanPrompt,
  Flashcard,
  // Custom styles for standard markdown elements
  h1: (props: any) => <h1 className="text-4xl font-extrabold mt-12 mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mt-10 mb-4 text-neutral-800 dark:text-neutral-200" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  p: (props: any) => <p className="text-[1.15rem] leading-[1.8] mb-8 font-medium text-neutral-700 dark:text-neutral-300 tracking-wide" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside space-y-3 mb-8 text-[1.15rem] leading-[1.8] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside space-y-3 mb-8 text-[1.15rem] leading-[1.8] font-medium text-neutral-700 dark:text-neutral-300 tracking-wide" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-neutral-400 dark:border-neutral-500 pl-4 py-1 italic bg-neutral-100 dark:bg-neutral-800 rounded-r-xl my-6" {...props} />
  ),
  hr: () => <hr className="my-12 border-neutral-200 dark:border-zinc-800" />
};

interface MDXViewerProps {
  mdxSource: MDXRemoteSerializeResult;
}

export default function MDXViewer({ mdxSource }: MDXViewerProps) {
  return (
    <div className="prose-custom max-w-none w-full animate-in fade-in duration-500">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
}
