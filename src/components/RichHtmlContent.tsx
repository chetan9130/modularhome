"use client";

import React from "react";
import { isHtml } from "@/utils/text";

interface RichHtmlContentProps {
  content?: string | null;
  className?: string;
}

export default function RichHtmlContent({
  content,
  className = "",
}: RichHtmlContentProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const hasHtmlTags = isHtml(content);

  if (!hasHtmlTags) {
    return (
      <div className={`text-sm sm:text-base text-[#4b5563] leading-relaxed whitespace-pre-line ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`rich-html ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
