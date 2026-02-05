[![Netlify Status](https://api.netlify.com/api/v1/badges/f9410406-bc69-4824-86c4-ecc236597275/deploy-status)](https://app.netlify.com/sites/wartgeld-generator-zug/deploys)

# Welcome to Wartgeld Generator Zug

This is a simple webapp to input form data and get a Wartgeld Rechnung for Kanton Zug. This page is dedicated to the hardworking midwifes in the Kanton Zug.

The app's main title displayed in the UI is "Wartgeld Generator".

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Loveable
- Swiss Post API

## How can I deploy this project?

ATM we are running on Netlify using automatic builds and manual deploys.

## Privacy

The application stores user settings and form data locally in the browser (Local Storage). Address autocomplete sends the entered street name to an address lookup service (Swiss Post API) to provide suggestions; no other user data is transmitted.

## Future ideas / status

- Address lookup via Swiss Post API is implemented for autocompletion of addresses.
