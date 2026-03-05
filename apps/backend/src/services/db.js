import { Firestore } from '@google-cloud/firestore';
import { createLogger, VERSION } from "@monorepo/shared";
import dotenv from 'dotenv';

dotenv.config();

const logger = createLogger('Database');

/**
 * Firestore Data Service
 * Implements the profile data storage using Google Cloud Firestore.
 */
class DataService {
    constructor() {
        this.db = new Firestore();
        this.collectionName = process.env.NODE_ENV === 'production' ? 'profiles_prod' : 'profiles_staging';
        this.profileDocId = 'samuel-soita';
    }

    async getProfile() {
        try {
            logger.info('Fetching profile data from Firestore');
            const doc = await this.db.collection(this.collectionName).doc(this.profileDocId).get();

            if (!doc.exists) {
                logger.warn('Profile not found in Firestore, returning default');
                return this.getDefaultProfile();
            }

            return doc.data();
        } catch (error) {
            logger.error('Error fetching profile from Firestore:', error);
            return this.getDefaultProfile();
        }
    }

    async updateProfile(newData) {
        try {
            logger.info('Updating profile data in Firestore', newData);
            const docRef = this.db.collection(this.collectionName).doc(this.profileDocId);
            await docRef.set({ ...newData, updatedAt: new Date().toISOString() }, { merge: true });

            const updated = await docRef.get();
            return updated.data();
        } catch (error) {
            logger.error('Error updating profile in Firestore:', error);
            throw error;
        }
    }

    getDefaultProfile() {
        return {
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
