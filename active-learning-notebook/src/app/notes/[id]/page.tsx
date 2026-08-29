import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import MDXViewer from "@/components/mdx/MDXViewer";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default async function ViewNote({ params }: { params: { id: string } }) {
  // Wait for params to resolve in Next.js 14+ if needed, but in Page Router this is fine.
  // In Next 15, `params` is a promise, so we await it.
  const { id } = await params;

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !note) {
    notFound();
  }

  // Serialize the MDX content for the client component
  const mdxSource = await serialize(note.content, {
    parseFrontmatter: true,
  });

  const dateStr = new Date(note.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <Link href="/archive" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-bold mb-8 transition-colors">
        <ArrowLeft size={20} />
        Back to Archive
      </Link>

      <div className="mb-12 space-y-4">
        <h1 className="text-5xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {note.title}
        </h1>
        <div className="flex items-center gap-2 text-neutral-500 font-medium">
          <CalendarDays size={18} />
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-3xl shadow-sm border border-neutral-100 dark:border-zinc-800">
        <MDXViewer mdxSource={mdxSource} />
      </div>
    </div>
  );
}
