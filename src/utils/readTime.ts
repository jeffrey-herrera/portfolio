const WORDS_PER_MINUTE = 200;

export function getReadTimeMinutes(content: string): number {
  const plainText = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[>#*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return 1;
  }

  const wordCount = plainText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min`;
}
