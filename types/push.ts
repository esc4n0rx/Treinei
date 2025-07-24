// types/push.ts
export interface PushSubscriptionObject {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

export interface PushSubscriptionData {
  fcm_token: string;
}