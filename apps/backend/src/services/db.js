import { createLogger, VERSION } from "@monorepo/shared";

const logger = createLogger('Database');

/**
 * Agile Data Service: Currently Mocked
 * Designed to be swapped for PostgreSQL/MongoDB/Firestore easily.
 */
class DataService {
    constructor() {
        this.profile = {
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

    async getProfile() {
        logger.info('Fetching profile data');
        return this.profile;
    }

    async updateProfile(newData) {
        logger.info('Updating profile data', newData);
        this.profile = { ...this.profile, ...newData };
        return this.profile;
    }
}

export const db = new DataService();
