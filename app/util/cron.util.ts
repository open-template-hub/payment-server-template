import cron from 'node-cron';

export function configureCronJobs() {
  cron.schedule(
    '*/5 * * * *',
    async () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`Memory Usage: ${used.toFixed(2)} MB`);
    },
    {
      timezone: 'Etc/UTC',
    }
  );
}
