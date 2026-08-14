TEAMFORGE AI

Tagline:

"Build better teams. Before the project begins."

CONCEPT:

TeamForge AI is an AI-powered project team formation platform.

Users can upload candidate resumes or enter candidate information. The application extracts skills, experience and role suitability, then uses AI to create an optimal project team.

The platform should:

1. Analyze candidate skills.

2. Recommend roles.

3. Build balanced project teams.

4. Calculate team compatibility.

5. Detect missing skills.

6. Recommend learning paths.

7. Generate a project roadmap.

8. Assign roadmap tasks to team members.

TARGET USERS:

- College students

- Hackathon teams

- Project managers

- Startup teams

- HR/team leads

TECH STACK:

- React

- Vite

- TypeScript

- Tailwind CSS

- shadcn/ui or equivalent modern component system

- Lucide React icons

- Recharts for analytics

- React Router

- Netlify deployment

- Netlify Functions for AI API calls

- Supabase-ready architecture for persistence

IMPORTANT:

Never expose AI API keys in frontend code.

All AI API requests must go through Netlify Functions.

DESIGN:

Create a premium modern AI SaaS interface.

Visual direction:

- Dark modern interface

- Subtle gradients

- Glassmorphism used carefully

- Large clean typography

- Rounded cards

- Thin borders

- Soft shadows

- Elegant hover animations

- Smooth page transitions

- Professional dashboard

- Avoid generic HR software appearance

- Make it look like a modern startup product

The UI must be responsive on desktop, tablet and mobile.

PAGES:

1. LANDING PAGE

Hero:

TEAMFORGE AI

"Build better teams. Before the project begins."

Subtitle:

"AI-powered team formation, skill-gap intelligence and project planning."

Buttons:

"Build Your Team"

"Explore Demo"

Show an attractive visual preview of:

- Team compatibility score

- Team members

- Skill coverage

- AI recommendations

Add sections:

- How it works

- Features

- Why TeamForge

- Example workflow

- CTA

2. DASHBOARD

Create a professional dashboard with:

Total Candidates

Active Projects

Teams Created

Average Team Compatibility

Recent Projects

Candidate Skill Distribution

Skill Gap Overview

Quick actions:

+ Add Candidate

+ Create Project

⚡ Build Team

3. CANDIDATES PAGE

Allow users to:

- Upload resumes

- Add candidates manually

- View candidate cards

- Search candidates

- Filter by skills

- Filter by role

Each candidate card should show:

- Name

- Profile avatar

- Primary role

- Skills

- Experience

- Top strengths

- Compatibility indicator

Create an "Add Candidate" modal.

Include demo candidates so the application works immediately without uploading files.

4. PROJECT CREATOR

Fields:

Project Name

Project Description

Required Team Size

Required Skills

Project Duration

Example:

Project:

AI Waste Management Platform

Required skills:

React

Node.js

Python

Machine Learning

UI/UX

Cloud

Button:

"Build Optimal Team"

5. AI TEAM BUILDER

This is the core feature.

Create a visually impressive AI processing state:

"Analyzing candidates..."

"Mapping skills..."

"Balancing roles..."

"Checking compatibility..."

"Detecting skill gaps..."

"Optimizing team composition..."

Then show the recommended team.

Each member should display:

Name

Recommended Role

Match Score

Relevant Skills

Why they were selected

Example:

Rahul

Backend Engineer

89%

Skills:

Node.js

MongoDB

REST APIs

Reason:

"Strong backend experience and complements the team's frontend expertise."

Show a team compatibility score:

93 / 100

Break it down into:

Skill Coverage

Role Balance

Experience Mix

Project Alignment

Collaboration Potential

6. TEAM ANALYSIS PAGE

Show:

Team Compatibility

Skill Coverage chart

Role Distribution

Team Strengths

Potential Risks

AI Recommendations

Skill Gaps

For skill gaps, display:

DevOps

HIGH PRIORITY

Cloud Deployment

MEDIUM

Automated Testing

MEDIUM

Each gap should have:

- Severity

- Explanation

- Recommended learning path

7. LEARNING PATH

Generate personalized learning recommendations.

Example:

DEVOPS LEARNING PATH

Step 1

Docker Fundamentals

Step 2

CI/CD Basics

Step 3

Cloud Deployment

Step 4

Monitoring

Show estimated learning time and assigned team member.

8. PROJECT ROADMAP

Create an AI-generated roadmap.

Display it as a beautiful timeline.

Example:

PHASE 1

Planning & Architecture

PHASE 2

Frontend Development

PHASE 3

Backend Development

PHASE 4

AI Integration

PHASE 5

Testing

PHASE 6

Deployment

Each task should show:

- Task

- Assigned member

- Role

- Duration

- Dependencies

- Status

Allow the user to switch between:

Timeline View

Kanban View

AI FEATURES:

Create reusable AI service functions:

extractCandidateSkills()

recommendRoles()

buildOptimalTeam()

calculateTeamCompatibility()

detectSkillGaps()

generateLearningPath()

generateProjectRoadmap()

AI responses MUST use structured JSON.

Example schema:

{

  "teamScore": 93,

  "members": [

    {

      "name": "Rahul",

      "role": "Backend Engineer",

      "matchScore": 89,

      "skills": ["Node.js", "MongoDB"],

      "reason": "Strong backend experience"

    }

  ],

  "skillGaps": [

    {

      "skill": "DevOps",

      "severity": "high",

      "recommendation": "Learn Docker and CI/CD"

    }

  ],

  "roadmap": []

}

IMPORTANT DEMO REQUIREMENT:

The application must work even without an AI API key.

Create a DEMO MODE using realistic mock data.

Add a small toggle:

LIVE AI

DEMO MODE

If the AI API is unavailable, automatically use demo data.

Create at least 8 realistic demo candidates with different:

- Skills

- Experience

- Roles

- Strengths

Include:

Frontend developers

Backend developers

ML engineers

UI/UX designers

DevOps engineers

Project managers

Create at least 2 example projects.

UX REQUIREMENTS:

Add:

- Loading animations

- Skeleton loaders

- Toast notifications

- Empty states

- Error states

- Confirmation dialogs

- Smooth transitions

- Hover states

- Tooltips

Do not create fake buttons that do nothing.

Every major button should perform an action.

NETLIFY:

Configure the project for Netlify.

Create:

netlify.toml

and:

netlify/functions/

Use Netlify Functions for server-side AI requests.

Ensure:

npm run build

works successfully.

The project must be deployable directly to Netlify.

Create a README containing:

1. Installation

2. Environment variables

3. Local development

4. Netlify deployment

5. AI API setup

6. Demo mode explanation

ENVIRONMENT VARIABLES:

Use environment variables for AI credentials.

Never hardcode API keys.

CODE QUALITY:

- TypeScript

- Reusable components

- Clean folder structure

- No unnecessary dependencies

- No console errors

- No broken links

- Accessible buttons

- Responsive design

- Proper loading/error handling

FOLDER STRUCTURE:

src/

  components/

  pages/

  layouts/

  services/

  hooks/

  data/

  types/

  utils/

netlify/

  functions/

Create reusable components such as:

CandidateCard

SkillBadge

CompatibilityScore

SkillGapCard

TeamMemberCard

TeamBuilder

AIProcessing

RoadmapTimeline

DashboardCard

ProjectCard

RoleDistributionChart

FINAL REQUIREMENT:

Do not stop after creating the UI.

Implement the complete working frontend flow.

The following demo flow MUST work:

Landing Page

→ Dashboard

→ Create Project

→ Select Demo Candidates

→ Build Optimal Team

→ AI Processing Animation

→ Recommended Team

→ Compatibility Score

→ Skill Gaps

→ Learning Path

→ Generate Project Roadmap

→ Roadmap Dashboard


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
