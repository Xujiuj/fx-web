"use client";

import { motion } from "framer-motion";
import type { TimelineEntry } from "@/lib/cms-content";
import { SectionHeading } from "./section-heading";

type AnimatedTimelineProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  summary?: string;
  timeline: TimelineEntry[];
};

export function AnimatedTimeline({ title, eyebrow, description, summary, timeline }: AnimatedTimelineProps) {
  if (timeline.length === 0) return null;

  return <section className="timeline-section timeline-landscape-section" id="path">
    <div className="timeline-section-heading">
      <SectionHeading eyebrow={eyebrow} title={title} />
      {description ? <p>{description}</p> : null}
    </div>
    <div className="timeline-landscape">
      <ol className="timeline-horizontal">
        {timeline.map((entry, index) => {
          const isTop = index % 2 === 0;
          return <motion.li className={isTop ? "is-top" : "is-bottom"} key={`${entry.year}-${index}`} initial={false} whileInView={{ opacity: [0.78, 1], y: [isTop ? -8 : 8, 0] }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.58, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
            <div className="timeline-entry-copy"><small>阶段 {entry.year}</small><h3>{entry.items[0] ?? entry.year}</h3><ul>{entry.items.slice(1).map((item) => <li key={item}>{item}</li>)}</ul></div>
            <span className="timeline-node" aria-hidden="true" />
          </motion.li>;
        })}
      </ol>
    </div>
    {summary ? <p className="timeline-summary">{summary}</p> : null}
  </section>;
}
