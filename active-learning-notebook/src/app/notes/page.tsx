import { redirect } from "next/navigation";

export default function NotesIndexRedirect() {
  // Redirect /notes directly to the archive (My Notes) page
  redirect("/archive");
}
