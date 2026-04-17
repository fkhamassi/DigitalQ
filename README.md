# DigitalQ

DigitalQ est une plateforme de billetterie numerique et de gestion intelligente de file d'attente pour les services municipaux.

## Pourquoi ce projet ?

Dans plusieurs administrations locales, les citoyens perdent encore beaucoup de temps dans des files d'attente longues, peu previsiblees et souvent mal communiquees.

DigitalQ a ete pense pour:
- reduire l'attente physique au guichet,
- donner plus de visibilite aux citoyens sur leur passage,
- aider les agents et les responsables a mieux organiser les flux,
- accelerer la modernisation des services publics de proximite.

## Probleme cible en Tunisie

Le projet adresse un probleme tres concret en Tunisie: la surcharge des guichets municipaux (etat civil, urbanisme, finances, affaires scolaires), avec des pics d'affluence, peu de visibilite sur les delais et une experience usager parfois stressante.

DigitalQ permet de:
- numeriser la prise de ticket,
- suivre en temps reel l'etat de la file,
- prioriser certains cas,
- produire des statistiques pour mieux dimensionner les ressources.

## A qui est destine DigitalQ ?

- Citoyens: prise de ticket et suivi du statut.
- Agents de guichet: appel et traitement des tickets.
- Administration (role admin): suivi des performances et pilotage operationnel.

## Fonctionnalites principales

- Authentification des agents/admin avec JWT.
- Gestion des tickets (creation, appel, service, absent).
- Gestion des files par service.
- Mises a jour en temps reel via Socket.IO.
- Collecte de feedback citoyen.
- Statistiques quotidiennes (volume, attente moyenne, satisfaction).

## Architecture technique

- Backend: Node.js + Express + Prisma + PostgreSQL + Socket.IO
- Frontend: React + Vite + Tailwind + Axios + Socket.IO client

## Prerequis

Avant de lancer le projet, installe:
- Node.js LTS (inclut npm)
- PostgreSQL (local ou distant)
- Git

### Installer Node.js et npm (Windows)

1. Telecharge Node.js LTS sur https://nodejs.org
2. Lance l'installateur et garde les options par defaut.
3. Verifie l'installation dans PowerShell:

```powershell
node -v
npm -v
```

Si les deux commandes retournent une version, npm est bien installe.

## Installation du projet

Depuis la racine du workspace, installe les dependances backend et frontend.

### 1) Backend

```powershell
cd backend
npm install
```

### 2) Frontend

```powershell
cd ..\frontend
npm install
```

## Configuration des variables d'environnement (backend)

Dans le dossier backend, cree le fichier .env a partir de .env.example:

```powershell
cd ..\backend
Copy-Item .env.example .env
```

Puis adapte les valeurs dans .env:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/digitalq"
PORT=3000
NODE_ENV=development
JWT_SECRET=change_me_with_a_long_random_secret
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

Important:
- DATABASE_URL doit pointer vers une base PostgreSQL accessible.
- JWT_SECRET doit etre defini (obligatoire pour le login).

## Initialiser la base de donnees

Depuis backend:

```powershell
npm run prisma:migrate
npm run prisma:seed
```

Ces commandes:
- appliquent les migrations Prisma,
- inserent les donnees de depart (services, guichets, users, tickets de test).

## Lancer l'application en local

Ouvre 2 terminaux.

### Terminal 1: Backend

```powershell
cd backend
npm run dev
```

Backend API: http://localhost:3000

### Terminal 2: Frontend

```powershell
cd frontend
npm run dev
```

Frontend: http://localhost:5173

Le frontend utilise un proxy Vite vers le backend pour /api et Socket.IO.

## Comptes de test (seed)

Apres npm run prisma:seed, tu peux te connecter avec:

- admin / Admin@2024
- fatma.mansour / Fatma@2024
- karim.belhadj / Karim@2024
- sami.belhaj / Sami@2024
- rania.ouali / Rania@2024
- nadia.chabbi / Nadia@2024

## Scripts utiles

Backend (dossier backend):
- npm run dev: demarrage avec nodemon
- npm start: demarrage normal
- npm run prisma:migrate: migration Prisma
- npm run prisma:seed: insertion des donnees initiales
- npm run prisma:studio: interface Prisma Studio

Frontend (dossier frontend):
- npm run dev: demarrage Vite
- npm run build: build production
- npm run preview: previsualisation build
- npm run lint: lint ESLint

## Structure du projet

- backend: API, logique metier, acces base de donnees
- frontend: interface utilisateur React
- backend/prisma: schema, migrations, seed

## API de sante

Pour verifier rapidement que le backend fonctionne:

GET http://localhost:3000/api/health

Reponse attendue: statut ok.

## Depannage rapide

- Erreur JWT: verifier JWT_SECRET dans backend/.env.
- Erreur base Prisma: verifier DATABASE_URL et que PostgreSQL est demarre.
- CORS/proxy: verifier que frontend tourne sur 5173 et backend sur 3000.
- Port occupe: changer PORT dans backend/.env et adapter le proxy frontend si besoin.

## Vision

DigitalQ vise a ameliorer concretement la qualite de service au niveau municipal en Tunisie, avec une approche simple: moins d'attente, plus de transparence, meilleure productivite des equipes.
