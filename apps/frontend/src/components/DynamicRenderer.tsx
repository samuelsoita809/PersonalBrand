import React, { Suspense } from 'react';
import { featureFlags } from '@monorepo/shared';
import { componentRegistry } from './registry';

interface DynamicRendererProps {
  componentName: string;
  props?: any;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ componentName, props }) => {
  // Feature Flag usage for safe rollouts
  if (componentName === 'AIInsights' && !featureFlags.isEnabled('ENABLE_AI_INSIGHTS')) {
    return null;
  }

  const Component = componentRegistry[componentName];
  if (!Component) return <div>Component "{componentName}" not found.</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
};

export default DynamicRenderer;
