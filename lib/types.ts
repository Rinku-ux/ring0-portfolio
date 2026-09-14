export const KINDS = ["game", "tool", "experiment"] as const;
export const STATUSES = ["live", "wip", "archive"] as const;

export type Kind = (typeof KINDS)[number];
export type Status = (typeof STATUSES)[number];

export type Project = {
  slug: string;
  title: string;
  kind: Kind;
  year: number;
  summary: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  cover: string;
  playable: boolean;
  featured: boolean;
  status: Status;
  body: string;
};
