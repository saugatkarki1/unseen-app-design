# Database Schema Reference

This document provides an overview of the database schema for the Frysta mentor platform.

## Core Tables

### profiles

User profiles with onboarding and role data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users) |
| email | text | User email |
| full_name | text | Display name |
| role | text | 'student' or 'mentor' |
| institution | text | School/company |
| current_skill_level | text | beginner/intermediate/advanced |
| time_commitment | text | casual/regular/intensive |
| motivation_type | text | career/curiosity/project/other |
| inferred_skill_domain | text | Auto-classified learning domain |
| mentor_expertise | text[] | Mentor specializations |
| mentor_experience_level | text | Mentor experience |
| mentor_availability | text | Mentor time commitment |
| onboarding_completed | boolean | Whether onboarding is done |

### mentors

Mentor profiles for assignment matching.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| name | text | Mentor name |
| specializations | text[] | Skill domains |
| is_active | boolean | Available for assignment |

### user_mentor

Student-mentor assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles (student) |
| mentor_id | uuid | FK to mentors |
| assigned_at | timestamptz | Assignment date |

### curriculum_items

Learning content catalog.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Item title |
| type | text | video/reading/exercise/project |
| difficulty | text | Beginner/Intermediate/Advanced |
| skill_domain | text | Associated skill area |

### user_curriculum

Personalized curriculum assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| curriculum_item_id | uuid | FK to curriculum_items |
| status | text | assigned/in_progress/completed |

### onboarding_responses

Step-by-step onboarding answers.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | FK to profiles |
| step_key | text | Step identifier |
| question_key | text | Question identifier |
| response_value | text | User's answer |

## Row Level Security (RLS)

All tables use RLS. Key policies:

- **profiles**: Users can read/update own profile
- **mentors**: Public read for active mentors
- **user_mentor**: Users can read own assignments
- **curriculum_items**: Public read for active items
- **user_curriculum**: Users can read/update own assignments

Service role key bypasses RLS for admin operations.

## Setting Up

1. Create tables using the SQL migrations
2. Enable RLS on all tables
3. Add RLS policies
4. Run `NOTIFY pgrst, 'reload schema'` to refresh PostgREST cache
