import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "lightweight-approval-workflow-for-social-teams",
  title: "A Lightweight Approval Workflow for Small Social Teams",
  description:
    "A practical review system for social teams that need brand control without slowing every post down with unnecessary approvals.",
  excerpt:
    "The cleanest review process is the one that defines who approves what before the content is written, not after the calendar is already full.",
  topPostRank: 2,
  publishedAt: "2026-04-27",
  updatedAt: "2026-04-27",
  authorName: "SocialRaven Editorial",
  category: "Publishing Workflows",
  readTime: "3 min read",
  coverImage: "/blog/lightweight-approval-workflow-for-social-teams.svg",
  coverImageAlt:
    "Editorial illustration for a lightweight approval workflow used by social teams.",
  tags: ["Approvals", "Team workflow", "Brand review"],
  keywords: [
    "social media approval workflow",
    "content review process",
    "social team collaboration",
    "brand approval process",
  ],
  sections: [
    {
      id: "decide-approval-levels-in-advance",
      title: "Decide approval levels in advance",
      content: (
        <>
          <p>
            Not every post needs the same review path. Campaign launches,
            customer stories, and paid-social assets may need a second pair of
            eyes, while routine educational posts usually do not.
          </p>
          <p>
            When approval rules are defined upfront, the team stops debating
            every individual post and starts following a repeatable operating
            rhythm.
          </p>
        </>
      ),
    },
    {
      id: "make-feedback-specific",
      title: "Make feedback specific",
      content: (
        <>
          <p>
            Feedback gets expensive when it stays vague. Reviewers should mark
            whether they are commenting on facts, tone, legal risk, or brand
            presentation so the creator knows what needs to change.
          </p>
          <ul>
            <li>Use one owner for each post.</li>
            <li>Keep one review deadline.</li>
            <li>Capture comments in the same place the final caption lives.</li>
          </ul>
        </>
      ),
    },
    {
      id: "protect-publishing-time",
      title: "Protect publishing time",
      content: (
        <>
          <p>
            Reviews should happen before scheduling day, not five minutes before
            a post is supposed to go live. That sounds obvious, but it is where
            most calendar stress comes from.
          </p>
          <p>
            A short approval workflow is effective only when it protects the
            team from last-minute decision churn.
          </p>
        </>
      ),
    },
  ],
};
