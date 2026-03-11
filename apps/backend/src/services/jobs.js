import { createLogger } from '@monorepo/shared';

const logger = createLogger('JobQueue');

/**
 * Simple Background Job Queue (JBGE)
 * In production, this would be replaced with BullMQ + Redis.
 */
class JobQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Adds a job to the queue
     * @param {string} name - Job name
     * @param {Function} task - Asynchronous function to execute
     * @param {Object} data - Metadata for the task
     */
    add(name, task, data = {}) {
        logger.info(`Enqueuing job: ${name}`, data);
        this.queue.push({ name, task, data });
        this.process();
    }

    async process() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const { name, task, data } = this.queue.shift();

        try {
            logger.info(`Processing job: ${name}`);
            await task(data);
            logger.info(`Job completed: ${name}`);
        } catch (error) {
            logger.error(`Job failed: ${name}`, error);
        } finally {
            this.isProcessing = false;
            this.process();
        }
    }
}

export const jobQueue = new JobQueue();
