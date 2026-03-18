import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../context/analytics';

const PageTracker: React.FC = () => {
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('page_view', {
      path: location.pathname,
      search: location.search,
      title: document.title,
    });
  }, [location, trackEvent]);

  return null;
};

export default PageTracker;
