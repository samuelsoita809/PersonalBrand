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
  const createQueryBuilder = (table, selectSchema) => {
    let storage = [];
    if (table === schema.page_views) storage = mockStorage.page_views;
    if (table === schema.cta_clicks) storage = mockStorage.cta_clicks;
    if (table === schema.analytics_events) storage = mockStorage.analytics_events;
    if (table === schema.hero_leads) storage = mockStorage.hero_leads;
    if (table === schema.free_requests) storage = mockStorage.free_requests;
    if (table === schema.project_requests) storage = []; // Add if needed
    if (table === schema.mentor_requests) storage = [];
    if (table === schema.coffee_requests) storage = [];

    const builder = {
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      // Handle the Promise-like behavior of Drizzle queries
      then: (onFullfilled) => {
        let result = [...storage];
        
        // Emulate aggregation if select has keys like 'total' or 'count'
        if (selectSchema && typeof selectSchema === 'object') {
          const transformed = {};
          Object.keys(selectSchema).forEach(key => {
            // Very simple emulation: if select has a key, it's likely a count or aggregation
            transformed[key] = result.length;
          });
          result = [transformed];
        }
        
        return Promise.resolve(result).then(onFullfilled);
      }
    };
    return builder;
  };

  const mockDb = {
    insert: vi.fn().mockImplementation((table) => ({
      values: vi.fn().mockImplementation((val) => {
        if (table === schema.page_views) mockStorage.page_views.push(val);
        if (table === schema.cta_clicks) mockStorage.cta_clicks.push(val);
        if (table === schema.analytics_events) mockStorage.analytics_events.push(val);
        if (table === schema.hero_leads) mockStorage.hero_leads.push(val);
        if (table === schema.free_requests) mockStorage.free_requests.push(val);
        return Promise.resolve();
      })
    })),
    select: vi.fn().mockImplementation((selectSchema) => ({
      from: vi.fn().mockImplementation((table) => createQueryBuilder(table, selectSchema))
    })),
    desc: vi.fn(x => x),
    asc: vi.fn(x => x)
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
    schema
  };
});
