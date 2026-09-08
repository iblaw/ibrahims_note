"use server";

import { serialize } from "next-mdx-remote/serialize";

export async function validateMdx(content: string) {
  try {
    // Attempt to compile the MDX exactly as we do when rendering
    await serialize(content, { parseFrontmatter: true });
    return { success: true };
  } catch (error: any) {
    console.error("MDX Validation Error:", error.message);
    
    // Attempt to extract line and column from MDX v2 error message format
    // MDX error messages usually look like: "Unexpected character `5` ...\n12 | \n13 | x <5\n   |    ^"
    // Or sometimes they have line:column numbers in the error object itself if we inspect it
    
    let line = 1;
    let column = 1;
    let message = error.message || "Unknown MDX error";

    // Regex to match MDX error line indicator like "13 | "
    const lineMatch = message.match(/(\d+)\s+\|/);
    if (lineMatch && lineMatch[1]) {
      line = parseInt(lineMatch[1], 10);
    } else if (error.line) {
      line = error.line;
    } else if (error.position && error.position.start && error.position.start.line) {
      line = error.position.start.line;
      column = error.position.start.column || 1;
    }

    // Try to extract column if we found the line via regex
    if (lineMatch && !error.position) {
      const colMatch = message.match(/\|\s+(\^+)/);
      if (colMatch && colMatch[1]) {
        // Find position of the first ^ relative to the |
        const pipeIndex = message.indexOf('|', message.indexOf(lineMatch[0]));
        const caretIndex = message.indexOf('^', pipeIndex);
        if (pipeIndex > -1 && caretIndex > -1) {
          // rough estimation of column
          column = caretIndex - pipeIndex - 1; 
        }
      }
    }

    return { 
      success: false, 
      error: {
        message: message.split('\n')[0], // Get just the main error sentence
        line: line,
        column: column
      }
    };
  }
}
