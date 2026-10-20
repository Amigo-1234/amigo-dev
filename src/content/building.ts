/*
 * "Currently building": projects with commits in the past fortnight, read
 * from their repositories on the date below. Update by hand; a project goes
 * here only when the commit history supports it.
 */
export const buildingAsOf = "20 October 2026";

export const building = [
  {
    slug: "amigo-world",
    name: "Amigo World",
    now: "Getting ready for an invited beta. This month: reactions, edits and unsend in encrypted messages, Moment framing and zoom, Web Push and the Creator Programme screens.",
    next: "Final legal text, a second administrator, then voice notes.",
    evidence: "Commits daily since 6 Oct",
    lastCommit: "20 Oct",
  },
  {
    slug: "kandys-treats",
    name: "Kandy's Treats",
    now: "Back-office tools for a kitchen that is already trading: partner commissions with invite codes, inventory and end-of-day history, and packaging priced per plate.",
    next: "Refining the operations console with the kitchen's staff.",
    evidence: "19 commits since 1 Oct",
    lastCommit: "20 Oct",
  },
  {
    slug: "markaz-il-ginna",
    name: "Markaz il Ginna",
    now: "Version 2 phases 1–6 shipped in one week: the bilingual foundation, staff and family sign-in, student administration, results and the student portal.",
    next: "Fees and a payment ledger, then promotion and graduation.",
    evidence: "82 commits, 6–12 Oct",
    lastCommit: "12 Oct",
  },
] as const;
