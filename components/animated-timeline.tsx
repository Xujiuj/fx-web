"use client";

import { motion } from "framer-motion";
import type { TimelineEntry } from "@/lib/cms-content";
import { SectionHeading } from "./section-heading";

export function AnimatedTimeline({ title, timeline }: { title: string; timeline: TimelineEntry[] }) {
  if (timeline.length === 0) return null;

  return <section className="timeline-section timeline-landscape-section" id="path">
    <SectionHeading title={title} />
    <div className="timeline-landscape">
      <ol className="timeline-horizontal">
        {timeline.map((entry, index) => {
          const isTop = index % 2 === 0;
          return <motion.li className={isTop ? "is-top" : "is-bottom"} key={`${entry.year}-${index}`} initial={{ opacity: 0, y: isTop ? -20 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 1.3, delay: index * 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <div className="timeline-entry-copy"><small>阶段 {entry.year}</small><h3>{entry.items[0] ?? entry.year}</h3><ul>{entry.items.slice(1).map((item) => <li key={item}>{item}</li>)}</ul></div>
            <span className="timeline-node" aria-hidden="true" />
          </motion.li>;
        })}
      </ol>
    </div>
  </section>;
}
