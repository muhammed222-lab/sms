module.exports = {
  apps: [
    {
      name: "rent-server",
      script: "./rent-server.js",
      env: {
        NODE_ENV: "development",
        PORT: 4001,
        API_KEY: "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm",
        MONGO_URI:
          "mongodb+srv://muhammed:H5PucHJ2NogD1Bzj@deemx.y6y3g.mongodb.net/?retryWrites=true&w=majority&appName=deemx",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          "pk_test_bWF4aW11bS1kb2ctNTkuY2xlcmsuYWNjb3VudHMuZGV2JA",
        CLERK_SECRET_KEY: "sk_test_YzasKF2zrvbzj4Q0DqsF2UP70X2THaxO36Rc9trYNr",
        NEXT_PUBLIC_API_TOKEN: "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm",
        NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDDWTZuAWy4R7YtaaF256fP0UN1W5RgQjs",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "deemax-3223e.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "deemax-3223e",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "deemax-3223e.firebasestorage.app",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1014783991061",
        NEXT_PUBLIC_FIREBASE_APP_ID:
          "1:1014783991061:web:f56670f29bb8c933915d1c",
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-ERDNKJGP2D",
        NEXT_PUBLIC_FLW_PUBLIC_KEY:
          "FLWPUBK_TEST-fd0d29a75c03d4f19df73e0d6ac9fbfa-X",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4001,
        API_KEY: "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm",
        MONGO_URI:
          "mongodb+srv://muhammed:H5PucHJ2NogD1Bzj@deemx.y6y3g.mongodb.net/?retryWrites=true&w=majority&appName=deemx",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          "pk_test_bWF4aW11bS1kb2ctNTkuY2xlcmsuYWNjb3VudHMuZGV2JA",
        CLERK_SECRET_KEY: "sk_test_YzasKF2zrvbzj4Q0DqsF2UP70X2THaxO36Rc9trYNr",
        NEXT_PUBLIC_API_TOKEN: "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm",
        NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDDWTZuAWy4R7YtaaF256fP0UN1W5RgQjs",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "deemax-3223e.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "deemax-3223e",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "deemax-3223e.firebasestorage.app",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1014783991061",
        NEXT_PUBLIC_FIREBASE_APP_ID:
          "1:1014783991061:web:f56670f29bb8c933915d1c",
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-ERDNKJGP2D",
        NEXT_PUBLIC_FLW_PUBLIC_KEY:
          "FLWPUBK_TEST-fd0d29a75c03d4f19df73e0d6ac9fbfa-X",
      },
    },
  ],
};
