const getClientMetadata = () => {
  if (typeof window === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    referrer: document.referrer || 'direct',
  };
};

/**
 * Analitik API'sine bir olay gönderir.
 * @param eventName - Olayın adı (örn: /links/create)
 * @param userId - Olayı gerçekleştiren kullanıcının ID'si
 * @param payload - Olaya özel ek veriler (örn: { shortCode: 'abc', isCustom: false })
 */
export const sendAnalyticsEvent = (
  eventName: string,
  userId: string,
  payload: Record<string, any> = {}
) => {
  const analyticsApiUrl = 'https://analytics.keremkk.com.tr/api/log';
  const appId = 'kisa-link-frontend';

  // İstemci bilgilerini ve olaya özel verileri birleştir
  const metadata = {
    ...getClientMetadata(), // Cihaz/tarayıcı bilgileri
    ...payload,             // Olaya özel veriler (shortCode, isCustom vb.)
  };

  const body = {
    appId: appId,
    userId: userId,
    endpoint: eventName,
    metadata: metadata,
  };

  // API'ye isteği gönder. Hata durumunda sadece konsola yazdır, kullanıcıyı etkileme.
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