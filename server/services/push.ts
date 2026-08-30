import axios from 'axios';
import { savePushToken, getPushToken } from './espn';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export function registerPushToken(token: string): void {
  savePushToken(token);
}

export async function sendPushNotification(title: string, body: string): Promise<void> {
  const token = getPushToken();
  if (!token) return;

  await axios.post(EXPO_PUSH_URL, { to: token, title, body }, {
    headers: { 'Content-Type': 'application/json' },
  });
}
