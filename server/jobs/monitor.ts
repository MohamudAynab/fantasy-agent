import cron from 'node-cron';
import { getInjuryReport } from '../services/injuries';
import { isAuthenticated } from '../services/espn';
import { sendPushNotification } from '../services/push';

// Runs every hour during the NFL week (Mon-Sat)
export function startMonitor() {
  cron.schedule('0 * * * 1-6', async () => {
    if (!isAuthenticated()) return;
    try {
      const injuries = await getInjuryReport();
      const critical = injuries.filter((r) => ['out', 'doubtful'].includes(r.gameStatus.toLowerCase()));
      if (critical.length > 0) {
        const names = critical.map((r) => `${r.player.name} (${r.gameStatus})`).join(', ');
        await sendPushNotification(
          `⚠️ ${critical.length} Injury Alert${critical.length > 1 ? 's' : ''}`,
          names
        );
      }
    } catch (e: any) {
      console.error('[monitor] injury check failed:', e.message);
    }
  });

  console.log('[monitor] Injury monitor started (runs hourly Mon-Sat)');
}
