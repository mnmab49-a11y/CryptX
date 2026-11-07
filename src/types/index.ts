export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  techSpecs: string[];
  status: 'Planned' | 'Design Ready' | 'Phase 2 Candidate';
}

export interface StepItem {
  stepNumber: string;
  title: string;
  description: string;
  detail: string;
  iconName: string;
}

export interface SecurityPrinciple {
  title: string;
  tag: string;
  description: string;
  technicalDetails: string[];
  iconName: string;
}

export interface ArchitectureLayer {
  layer: string;
  tech: string;
  role: string;
}
