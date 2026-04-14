import { vi } from 'vitest';
import * as schema from './src/db/schema.js';

// In-memory simple storage for mocks
const mockStorage = {
  page_views: [],
  cta_clicks: [],
  analytics_events: [],
  hero_leads: [],
  free_requests: []
};

// Mock the database service to prevent real connections during tests
vi.mock('./src/services/db.js', () => {
  const mockDb = {
    insert: vi.fn().mockImplementation((table) => ({
      values: vi.fn().mockImplementation((val) => {
        // Compare with real schema objects
        if (table === schema.page_views) mockStorage.page_views.push(val);
        if (table === schema.cta_clicks) mockStorage.cta_clicks.push(val);
        if (table === schema.analytics_events) mockStorage.analytics_events.push(val);
        if (table === schema.hero_leads) mockStorage.hero_leads.push(val);
        if (table === schema.free_requests) mockStorage.free_requests.push(val);
        
        return Promise.resolve();
      })
    })),
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation((table) => {
        if (table === schema.page_views) return Promise.resolve([...mockStorage.page_views]);
        if (table === schema.cta_clicks) return Promise.resolve([...mockStorage.cta_clicks]);
        if (table === schema.analytics_events) return Promise.resolve([...mockStorage.analytics_events]);
        if (table === schema.hero_leads) return Promise.resolve([...mockStorage.hero_leads]);
        if (table === schema.free_requests) return Promise.resolve([...mockStorage.free_requests]);
        
        return Promise.resolve([]);
      })
    })),
    desc: vi.fn(x => x),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  };

  return {
    db: {
      getProfile: vi.fn().mockResolvedValue({
        id: 'samuel-soita',
        name: 'Samuel Soita',
        title: 'Software Engineer',
        bio: 'Passionate about building scalable applications and premium user experiences.',
        socials: { github: 'samuelsoita809', linkedin: 'samuel-soita' },
        version: '1.0.0'
      }),
      updateProfile: vi.fn(),
      db: mockDb
    },
    schema // Export the same schema objects
  };
});
