"use client";

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
          return <li className={isTop ? "is-top" : "is-bottom"} key={`${entry.year}-${index}`}>
            <div className="timeline-entry-copy"><small>阶段 {entry.year}</small><h3>{entry.items[0] ?? entry.year}</h3><ul>{entry.items.slice(1).map((item) => <li key={item}>{item}</li>)}</ul></div>
            <span className="timeline-node" aria-hidden="true" />
          </li>;
        })}
      </ol>
    </div>
    {summary ? <p className="timeline-summary">{summary}</p> : null}
  </section>;
}
