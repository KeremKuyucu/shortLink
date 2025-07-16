export const sendAnalyticsEvent = (
  eventName: string,
  userId: string,
) => {
  console.log('sendAnalyticsEvent çağrıldı.'); // Fonksiyonun çağrıldığını kontrol et
  console.log('Event Adı:', eventName);
  console.log('Kullanıcı Kimliği:', userId);

  const analyticsApiUrl = 'https://analytics.keremkk.com.tr/api/analytics';
  const appId = 'kisalink';

  const body = {
    appId: appId,
    userId: userId,
    endpoint: eventName,
  };

  console.log('Gönderilecek Body:', body); // Gönderilecek body'yi kontrol et

  fetch(analyticsApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(response => {
      console.log('API Yanıtı:', response); // API yanıtını kontrol et
      if (!response.ok) {
        // HTTP hatası durumunda (örneğin 404, 500)
        console.error('API isteği başarısız oldu, durum kodu:', response.status);
        // Hatanın detaylarını görmek için yanıtı JSON olarak parse etmeyi deneyin
        return response.json().then(err => { throw new Error(JSON.stringify(err)); });
      }
      return response.json(); // Yanıtı JSON olarak parse et
    })
    .then(data => {
      console.log('Analytics event başarıyla gönderildi:', data); // Başarılı yanıtı logla
    })
    .catch(error => {
      console.error('Analytics event gönderilemedi:', error); // Hata mesajını yakala
    });
};