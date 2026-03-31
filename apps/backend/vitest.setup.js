import { vi } from 'vitest';

// In-memory simple storage for mocks
const mockStorage = {
  page_views: []
};

// Mock the database service to prevent real connections during tests
vi.mock('./src/services/db.js', () => ({
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
    db: {
      insert: vi.fn().mockImplementation(() => ({
        values: vi.fn().mockImplementation((val) => {
          mockStorage.page_views.push(val);
          return Promise.resolve();
        })
      })),
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => Promise.resolve([...mockStorage.page_views]))
      })),
      desc: vi.fn(x => x)
    },
    schema: {
        page_views: { name: 'page_views' },
        analytics_events: { name: 'analytics_events' }
    }
  },
  schema: {
    page_views: { name: 'page_views' },
    analytics_events: { name: 'analytics_events' }
  }
}));
