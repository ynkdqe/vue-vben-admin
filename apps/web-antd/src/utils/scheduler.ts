import type { SimpleIntervalSchedule } from 'toad-scheduler';

import { AsyncTask, SimpleIntervalJob, ToadScheduler } from 'toad-scheduler';

const registeredJobs = new Set<string>();
let scheduler: null | ToadScheduler = null;

function ensureScheduler(): ToadScheduler {
  if (!scheduler) {
    scheduler = new ToadScheduler();
  }
  return scheduler;
}

function cleanupSchedulerIfIdle() {
  if (scheduler && registeredJobs.size === 0) {
    scheduler.stop();
    scheduler = null;
  }
}

export interface SimpleIntervalJobConfig {
  handler: () => Promise<void> | void;
  preventOverrun?: boolean;
  schedule: SimpleIntervalSchedule;
  onError?: (error: unknown) => void;
}

export function registerSimpleIntervalJob(
  id: string,
  config: SimpleIntervalJobConfig,
): void {
  const schedulerInstance = ensureScheduler();

  if (registeredJobs.has(id) && schedulerInstance.existsById(id)) {
    schedulerInstance.stopById(id);
    schedulerInstance.removeById(id);
    registeredJobs.delete(id);
  }

  const task = new AsyncTask(
    id,
    async () => {
      await config.handler();
    },
    (error: Error) => {
      if (config.onError) {
        config.onError(error);
        return;
      }
      console.error(`[Scheduler] Job "${id}" failed`, error);
    },
  );

  const job = new SimpleIntervalJob(config.schedule, task, {
    id,
    preventOverrun: config.preventOverrun ?? true,
  });

  schedulerInstance.addSimpleIntervalJob(job);
  registeredJobs.add(id);
}

export function removeJob(id: string): void {
  if (!scheduler || !registeredJobs.has(id)) {
    return;
  }

  if (scheduler.existsById(id)) {
    scheduler.stopById(id);
    scheduler.removeById(id);
  }
  registeredJobs.delete(id);
  cleanupSchedulerIfIdle();
}

export function shutdownScheduler(): void {
  if (!scheduler) {
    return;
  }

  scheduler.stop();
  scheduler = null;
  registeredJobs.clear();
}
