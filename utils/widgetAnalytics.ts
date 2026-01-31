// src/utils/widgetAnalytics.ts
export async function logEvent(eventType: string, eventData: Record<string, any> = {}) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/widget-analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: process.env.NEXT_PUBLIC_WIDGET_PUBLIC_KEY,
        event_type: eventType,
        event_data: eventData,
      }),
    });
  } catch (error) {
    console.error('Failed to log widget event:', error);
  }
}
