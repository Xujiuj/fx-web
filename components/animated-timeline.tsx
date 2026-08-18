"use client";

import type { TimelineEntry } from "@/lib/cms-content";
import Link from "next/link";
import { SectionHeading } from "./section-heading";

type AnimatedTimelineProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  summary?: string;
  timeline: TimelineEntry[];
};

const solutionLinks = ["/solution-standard", "/solution-practical", "/solution-consulting", "/solution-platform"];

export function AnimatedTimeline({ title, eyebrow, description, summary, timeline }: AnimatedTimelineProps) {
  if (timeline.length === 0) return null;

  return <section className="timeline-section capability-orbit-section" id="path">
    <div className="timeline-section-heading">
      <div className="timeline-section-heading-copy">
        <SectionHeading eyebrow={eyebrow} title={title} />
        {summary ? <p className="timeline-summary">{summary}</p> : null}
      </div>
      {description ? <p className="timeline-description">{description}</p> : null}
    </div>
    <div className="capability-orbit">
      <div className="capability-orbit-visual" aria-hidden="true">
        <svg viewBox="0 0 620 620" focusable="false">
          <circle className="capability-orbit-track capability-orbit-track-outer" cx="310" cy="310" r="232" />
          <circle className="capability-orbit-track capability-orbit-track-inner" cx="310" cy="310" r="176" />
          <circle className="capability-orbit-sweep capability-orbit-sweep-orange" cx="310" cy="310" r="232" />
          <circle className="capability-orbit-sweep capability-orbit-sweep-yellow" cx="310" cy="310" r="176" />
        </svg>
        <div className="capability-orbit-core">
          <span>CAPABILITY OS</span>
          <strong>能力中枢</strong>
          <small>4-STAGE SYSTEM</small>
        </div>
      </div>
      <ol className="capability-orbit-stages">
        {timeline.map((entry, index) => {
          const href = solutionLinks[index];
          const contents = <>
            <span className="capability-orbit-link" aria-hidden="true" />
            <span className="capability-orbit-node" aria-hidden="true"><b>{entry.year}</b></span>
            <div className="capability-orbit-copy"><small>STAGE {entry.year}</small><h3>{entry.items[0] ?? entry.year}</h3><ul>{entry.items.slice(1).map((item) => <li key={item}>{item}</li>)}</ul></div>
          </>;
          return <li className={`capability-orbit-stage capability-orbit-stage-${index + 1}`} key={`${entry.year}-${index}`}>
            {href ? <Link href={href} aria-label={`查看${entry.items[0] ?? entry.year}解决方案`}>{contents}</Link> : contents}
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
