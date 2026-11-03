export interface EditorialBlock {
  heading: boolean;
  text: string;
}
export function editorialBlocks(body: string): EditorialBlock[] {
  const blocks: EditorialBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) {
      blocks.push({ heading: false, text: paragraph.join('\n') });
      paragraph = [];
    }
  };
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      flush();
      blocks.push({ heading: true, text: line.slice(3).trim() });
    } else if (!line.trim()) {
      flush();
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
