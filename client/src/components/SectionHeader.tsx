type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => (
  <header className="section-header">
    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
    <h2>{title}</h2>
    {description ? <p>{description}</p> : null}
  </header>
);

export default SectionHeader;
