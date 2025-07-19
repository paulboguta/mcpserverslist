"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';

interface MarkdownRendererProps {
  content: string;
  repoUrl?: string | null;
}

export function MarkdownRenderer({ content, repoUrl }: MarkdownRendererProps) {
  // Clean up excessive whitespace while preserving intentional formatting
  const cleanedContent = content
    ? content
        .replace(/\n{4,}/g, '\n\n\n') // Replace 4+ newlines with max 3
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces/tabs
        .trim()
    : '';

  if (!cleanedContent) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">README content not available yet.</p>
        {repoUrl && (
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <a href={`${repoUrl}#readme`} target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-table:text-sm prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2 prose-p:leading-normal prose-p:my-1.5 prose-h1:text-lg prose-h1:mb-2 prose-h1:mt-4 prose-h2:text-base prose-h2:mb-1.5 prose-h2:mt-3 prose-h3:text-sm prose-h3:mb-1 prose-h3:mt-2 prose-h4:text-sm prose-h4:mb-1 prose-h4:mt-2 prose-h5:text-xs prose-h6:text-xs prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-blockquote:my-2 prose-hr:my-3">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-border p-3 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border p-3">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <div className="my-3 flex justify-center">
              <img
                src={src}
                alt={alt || ''}
                className="max-w-full max-h-96 h-auto rounded-md border border-border shadow-sm object-contain"
                loading="lazy"
                onError={(e) => {
                  // Simple error handling without state
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="p-4 border border-dashed border-border rounded-md bg-muted/30 text-center text-sm text-muted-foreground">
                        <p>Image not available: ${alt || 'Screenshot'}</p>
                        ${src ? `<a href="${src}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">View original</a>` : ''}
                      </div>
                    `;
                  }
                }}
              />
            </div>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-3 border border-border text-sm">
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}