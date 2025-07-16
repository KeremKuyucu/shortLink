export const sendAnalyticsEvent = (
  eventName: string,
  userId: string,
) => {
  const analyticsApiUrl = 'https://analytics.keremkk.com.tr/api/analytics';
  const appId = 'kisalink';

  const body = {
    appId: appId,
    userId: userId,
    endpoint: eventName,
  };

  fetch(analyticsApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(error => {
    console.error('Analytics event failed to send:', error);
  });
};