// components/security/middle-east-guard.tsx
import { ReactNode } from 'react';
import { useSecurity } from '@/contexts/security-context';

export function MiddleEastGuard({ children }: { children: ReactNode }) {
  const { geo, riskLevel } = useSecurity();

  if (!['AE', 'SA', 'QA', 'KW'].includes(geo)) {
    return <div>Feature unavailable in your region</div>;
  }

  if (riskLevel > 30) {
    return <div>Additional verification required for this action</div>;
  }

  return <>{children}</>;
}