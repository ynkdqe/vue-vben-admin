import { registerSimpleIntervalJob, removeJob } from './scheduler';

const JOB_ID = 'log-current-time';

let isRegistered = false;

export function startTimeLogger(): void {
  if (isRegistered) {
    return;
  }

  registerSimpleIntervalJob(JOB_ID, {
    handler: () => {
      const now = new Date().toLocaleString();
      // eslint-disable-next-line no-console
      console.log(`[TimeLogger] Current time: ${now}`);
    },
    schedule: { seconds: 30 },
  });

  isRegistered = true;
}

export function stopTimeLogger(): void {
  if (!isRegistered) {
    return;
  }

  removeJob(JOB_ID);
  isRegistered = false;
}
