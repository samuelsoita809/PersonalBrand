import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { createLogger, VERSION } from "@monorepo/shared";
import dotenv from 'dotenv';
import * as schema from '../db/schema.js';
import { z } from 'zod';

dotenv.config();

const logger = createLogger('Database');

// Zod schema for profile validation
export const profileSchema = z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    bio: z.string().optional(),
    socials: z.record(z.string()).optional(),
    version: z.string().optional(),
});

/**
 * Drizzle PostgreSQL Data Service (Supabase)
 * Implements the profile data storage using Supabase/PostgreSQL.
 */
class DataService {
    constructor() {
        const client = postgres(process.env.DATABASE_URL, {
            ssl: 'require',
            connect_timeout: 10
        });
        this.db = drizzle(client, { schema });
        this.profileId = 'samuel-soita';
    }

    async getProfile() {
        try {
            logger.info('Fetching profile data from Supabase');
            const result = await this.db.query.profiles.findFirst({
                where: eq(schema.profiles.id, this.profileId)
            });

            if (!result) {
                logger.warn('Profile not found in Supabase, returning default');
                return this.getDefaultProfile();
            }

            return result;
        } catch (error) {
            logger.error('Error fetching profile from Supabase:', error);
            return this.getDefaultProfile();
        }
    }

    async updateProfile(newData) {
        try {
            logger.info('Validating and updating profile data in Supabase');
            
            // Validate data
            const validatedData = profileSchema.parse(newData);

            await this.db.insert(schema.profiles)
                .values({
                    id: this.profileId,
                    ...validatedData,
                    updatedAt: new Date()
                })
                .onConflictDoUpdate({
                    target: schema.profiles.id,
                    set: {
                        ...validatedData,
                        updatedAt: new Date()
                    }
                });

            return await this.getProfile();
        } catch (error) {
            logger.error('Error updating profile in Supabase:', error);
            throw error;
        }
    }

    getDefaultProfile() {
        return {
            id: this.profileId,
            name: "Samuel Soita",
            title: "Software Engineer",
            version: VERSION,
            bio: "Passionate about building scalable applications and premium user experiences.",
            socials: {
                github: "samuelsoita809",
                linkedin: "samuel-soita"
            }
        };
    }
}

export const db = new DataService();
export { schema };

