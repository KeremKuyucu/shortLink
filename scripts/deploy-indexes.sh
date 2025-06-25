#!/bin/bash

echo "🔥 Firebase Firestore Index'lerini deploy ediliyor..."

# Firebase CLI kurulu mu kontrol et
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI kurulu değil. Lütfen önce 'npm install -g firebase-tools' çalıştırın."
    exit 1
fi

# Firebase login kontrolü
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Firebase'e giriş yapılıyor..."
    firebase login
fi

# Index'leri deploy et
echo "📊 Firestore index'leri deploy ediliyor..."
firebase deploy --only firestore:indexes

echo "✅ Index deployment tamamlandı!"
echo "🔗 Firebase Console'dan index durumunu kontrol edebilirsiniz:"
echo "https://console.firebase.google.com/project/keremkk-auth/firestore/indexes"
