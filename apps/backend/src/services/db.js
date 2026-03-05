import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import { createLogger, VERSION } from "@monorepo/shared";
import dotenv from 'dotenv';
import * as schema from '../db/schema.ts';

dotenv.config();

const logger = createLogger('Database');

/**
 * Drizzle MySQL Data Service
 * Implements the profile data storage using TiDB Cloud MySQL.
 */
class DataService {
    constructor() {
        this.connection = mysql.createPool({
            uri: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: true
            }
        });
        this.db = drizzle(this.connection, { schema, mode: 'default' });
        this.profileId = 'samuel-soita';
    }

    async getProfile() {
        try {
            logger.info('Fetching profile data from MySQL');
            const result = await this.db.query.profiles.findFirst({
                where: eq(schema.profiles.id, this.profileId)
            });

            if (!result) {
                logger.warn('Profile not found in MySQL, returning default');
                return this.getDefaultProfile();
            }

            // Drizzle might return JSON fields as strings or objects depending on the driver
            const socials = typeof result.socials === 'string' ? JSON.parse(result.socials) : result.socials;

            return { ...result, socials };
        } catch (error) {
            logger.error('Error fetching profile from MySQL:', error);
            return this.getDefaultProfile();
        }
    }

    async updateProfile(newData) {
        try {
            logger.info('Updating profile data in MySQL', newData);

            await this.db.insert(schema.profiles)
                .values({
                    id: this.profileId,
                    ...newData,
                    updatedAt: new Date()
                })
                .onDuplicateKeyUpdate({
                    set: {
                        ...newData,
                        updatedAt: new Date()
                    }
                });

            return await this.getProfile();
        } catch (error) {
            logger.error('Error updating profile in MySQL:', error);
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
