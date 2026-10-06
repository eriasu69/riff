import type { ElementType, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  as?: ElementType;
  id?: string;
}

export function SectionLabel({ children, as: Tag = 'span', id }: Props) {
  return (
    <Tag id={id} className="section-label">
      {children}
    </Tag>
  );
}
