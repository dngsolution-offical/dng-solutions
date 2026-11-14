// server/_firebase.cjs — Firebase Admin SDK ინიციალიზაცია (ერთჯერადი, გაზიარებული ყველა handler-ისთვის)
// თქვენს repo-ში ეს ფაილი დიდი ალბათობით უკვე არსებობს ასეთი ან მსგავსი სახით —
// თუ არსებული ფაილი განსხვავდება მხოლოდ init-ის სინტაქსით (მაგ. ძველი credentials{} ფორმა),
// დაანაცვლეთ ეს ის ვერსია, თორემ ეს ახალი ფაილები (payments-create.js, bog-webhook.js) ამას ელოდება.
'use strict';

const admin = require('firebase-admin');

let app;
function getApp() {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.apps[0];
    return app;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var არ არის დაყენებული');
  const serviceAccount = JSON.parse(raw);
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return app;
}

function getAuth() {
  return admin.auth(getApp());
}

function getFirestore() {
  return admin.firestore(getApp());
}

module.exports = {
  getApp,
  getAuth,
  getFirestore,
  FieldValue: admin.firestore.FieldValue,
};
