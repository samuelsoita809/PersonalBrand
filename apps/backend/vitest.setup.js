import { vi } from 'vitest';

// Mock the database service to prevent real connections during tests
vi.mock('./src/services/db.js', () => ({
  db: {
    getProfile: vi.fn().mockResolvedValue({
      id: 'samuel-soita',
      name: 'Samuel Soita',
      title: 'Software Engineer',
      bio: 'Passionate about building scalable applications and premium user experiences.',
      socials: {
        github: 'samuelsoita809',
        linkedin: 'samuel-soita'
      },
      version: '1.0.0'
    }),
    updateProfile: vi.fn().mockResolvedValue({
      id: 'samuel-soita',
      name: 'Samuel Soita',
      title: 'Software Engineer Updated'
    })
  }
}));
