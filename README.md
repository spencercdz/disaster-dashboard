# OPERA Disaster Dashboard

A modern web dashboard for Humanitarian Assistance and Disaster Response, built with Next.js, React, Supabase, Chart.js, and MapLibre. This app visualizes disaster-related tweets, predictions, sentiment, and analytics to help humanitarian efforts.

---

## Table of Contents
- [Features](#features)
- [Live Demo](#live-demo)
- [Prerequisites](#prerequisites)
- [Step 1: Clone the Repository](#step-1-clone-the-repository)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Set Up Environment Variables](#step-3-set-up-environment-variables)
- [Step 4: Set Up Supabase Database](#step-4-set-up-supabase-database)
- [Step 5: Run the Development Server](#step-5-run-the-development-server)
- [Step 6: Using the Dashboard](#step-6-using-the-dashboard)
- [Step 7: Customization & Styling](#step-7-customization--styling)
- [Step 8: Build for Production](#step-8-build-for-production)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Learn More](#learn-more)

---

## Features
- **Search** disaster-related tweets by country, disaster type, and year.
- **Interactive Map** showing disaster locations (MapLibre, no API key needed for default tiles).
- **Sentiment Analysis** and breakdown of tweets.
- **Analytics** for requests, damages, and other indicators.
- **Modern UI** with Tailwind CSS and Chart.js.
- **Responsive** and mobile-friendly design.

---

## Live Demo
*No public demo yet. You can run it locally by following the steps below!*

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or newer recommended). [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **A free [Supabase](https://supabase.com/) account** (for the database and API keys)
- **Git** (optional, but recommended for cloning the repo)

---

## Step 1: Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal on Mac/Linux) and run:

```bash
git clone https://github.com/spencercdz/disaster-dashboard.git
cd disaster-dashboard
```

If you don't have Git, you can also [download the ZIP](https://github.com/your-username/disaster-dashboard/archive/refs/heads/main.zip) and extract it.

---

## Step 2: Install Dependencies

Install all the required packages by running:

```bash
npm install
```

This will install everything you need to run the app, including Next.js, React, Supabase, Chart.js, MapLibre, and Tailwind CSS.

---

## Step 3: Set Up Environment Variables

The app needs to connect to your Supabase database. Create a file called `.env.local` in the root of your project (same folder as `package.json`).

Add the following lines to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- **Where do I get these?**
  - Log in to [Supabase](https://app.supabase.com/)
  - Go to your project > Settings > API
  - Copy the `Project URL` and `anon public` key

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abc123xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## Step 4: Set Up Supabase Database

You need to create the right tables in Supabase for the dashboard to work.

### 4.1. Create a Supabase Project
- Go to [Supabase](https://app.supabase.com/)
- Click **New Project** and follow the instructions

### 4.2. Create Tables

#### Table: `tweets`
- Go to **Table Editor** > **New Table**
- Table name: `tweets`
- Add columns (see below)

| Name         | Type    |
|--------------|---------|
| query        | text    |
| tweet_id     | text    |
| time         | text    |
| language     | text    |
| username     | text    |
| verified     | text    |
| followers    | text    |
| location     | text    |
| retweets     | text    |
| favorites    | text    |
| replies      | text    |
| text         | text    |

#### Table: `predictions`
- Table name: `predictions`
- Add columns (see below, you can copy-paste or add as needed)

| Name                      | Type    |
|---------------------------|---------|
| tweet_id                  | text    |
| sentiment                 | text    |
| verified                  | text    |
| username                  | text    |
| date                      | text    |
| retweets                  | text    |
| tweet                     | text    |
| sentiment_confidence      | text    |
| request                   | text    |
| request_confidence        | text    |
| offer                     | text    |
| offer_confidence          | text    |
| aid_related               | text    |
| aid_related_confidence    | text    |
| medical_help              | text    |
| medical_help_confidence   | text    |
| medical_products          | text    |
| medical_products_confidence| text   |
| search_and_rescue         | text    |
| search_and_rescue_confidence| text  |
| security                  | text    |
| military                  | text    |
| child_alone               | text    |
| water                     | text    |
| food                      | text    |
| shelter                   | text    |
| clothing                  | text    |
| money                     | text    |
| missing_people            | text    |
| refugees                  | text    |
| death                     | text    |
| other_aid                 | text    |
| infrastructure_related    | text    |
| transport                 | text    |
| buildings                 | text    |
| electricity               | text    |
| tools                     | text    |
| hospitals                 | text    |
| shops                     | text    |
| aid_centers               | text    |
| other_infrastructure      | text    |
| weather_related           | text    |
| floods                    | text    |
| storm                     | text    |
| fire                      | text    |
| earthquake                | text    |
| cold                      | text    |
| other_weather             | text    |
| direct_report             | text    |
| genre                     | text    |
| related                   | text    |

#### Table: `requests` (optional, for analytics)
- Table name: `requests`
- Add columns as needed for your analytics (not strictly required for basic dashboard)

### 4.3. Import Data
- You can import CSV files into Supabase using the Table Editor's **Import Data** button.
- Make sure your CSV columns match the table columns above.

---

## Step 5: Run the Development Server

Start the app locally:

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- You should see the dashboard UI.

---

## Step 6: Using the Dashboard

- **Search Panel:** Enter a country, select a disaster type, and year, then click **Search** to fetch relevant tweets.
- **Map:** Shows disaster locations (centered on Myanmar by default).
- **Sentiment Analysis:** See the overall and breakdown of tweet sentiment.
- **Analytics:** View counts and breakdowns for requests, damages, and more.
- **Tweets:** Browse, filter, and expand tweets. Click "View on X.com" to see the original tweet.

---

## Step 7: Customization & Styling

- **Change the background:** Replace `public/background.jpg` with your own image.
- **Edit styles:** Global styles are in `src/app/globals.css`. Tailwind CSS is used for most styling.
- **Modify components:** All UI components are in `src/components/`.
- **Add new features:** You can add new pages or API routes in `src/app/`.

---

## Step 8: Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

- The app will run on [http://localhost:3000](http://localhost:3000) by default.

---

## Troubleshooting & FAQ

### Q: I get a Supabase error or blank data.
- **A:** Double-check your `.env.local` values and make sure your Supabase tables are set up and populated with data.

### Q: The map doesn't load or is blank.
- **A:** The map uses free tile providers. If you see errors, you may have hit a rate limit. You can use your own [Thunderforest](https://www.thunderforest.com/) or [MapLibre](https://maplibre.org/) API key by editing the map tile URL in `src/components/ContainerMap.tsx`.

### Q: How do I get sample data?
- **A:** You can create your own CSVs or use open disaster tweet datasets. Make sure the columns match the table definitions above.

### Q: How do I reset the dashboard?
- **A:** Just refresh the page. If you want to clear data, do so in Supabase.

### Q: Can I deploy this online?
- **A:** Yes! You can deploy to [Vercel](https://vercel.com/) or any platform that supports Next.js. Make sure to set your environment variables in the deployment settings.

### Q: I see weird styling or layout issues.
- **A:** Make sure all dependencies are installed. Try deleting `node_modules` and running `npm install` again.

### Q: How do I update dependencies?
- **A:** Run `npm update` to update packages.

### Q: Where can I get help?
- **A:** [Supabase Docs](https://supabase.com/docs), [Next.js Docs](https://nextjs.org/docs), or open an issue in this repo.

---

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [MapLibre](https://maplibre.org/)
