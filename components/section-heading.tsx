export function SectionHeading({
  eyebrow,
  title
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
    </div>
  );
}
