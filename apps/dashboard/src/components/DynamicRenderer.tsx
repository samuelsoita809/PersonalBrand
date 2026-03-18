import React, { Suspense } from 'react';
import { componentRegistry } from './registry';

interface DynamicRendererProps {
  componentName: string;
  props?: Record<string, unknown>;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ componentName, props }) => {
  const Component = componentRegistry[componentName];
  if (!Component) return <div className="p-4 text-red-400">Component "{componentName}" not found in registry.</div>;

  return (
    <Suspense fallback={
      <div className="w-full h-32 flex items-center justify-center animate-pulse bg-white/5 rounded-xl border border-white/10">
        <div className="text-slate-500">Loading {componentName}...</div>
      </div>
    }>
      <Component {...props} />
    </Suspense>
  );
};

export default DynamicRenderer;
