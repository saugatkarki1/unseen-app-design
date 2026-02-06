// scripts/seed-phase3-data.ts
// ============================================================================
// PHASE 3 SEED DATA SCRIPT
// ============================================================================
// Run this script to seed the mentors and curriculum_items tables.
// Usage: npx tsx scripts/seed-phase3-data.ts
// ============================================================================

import { createClient } from "@supabase/supabase-js"
import { seedMentors as MENTOR_DATA } from "@/data/seed-mentors"
import { seedCurriculumItems as CURRICULUM_DATA } from "@/data/seed-curriculum"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function seedMentors() {
    console.log("Seeding mentors...")

    const mentors = MENTOR_DATA.map((m) => ({
        name: m.name,
        avatar_url: m.avatar_url,
        bio: m.bio,
        specializations: m.specializations,
        is_active: true,
    }))

    const { data, error } = await supabase
        .from("mentors")
        .upsert(mentors, { onConflict: "name" })
        .select()

    if (error) {
        console.error("Error seeding mentors:", error)
        return
    }

    console.log(`Seeded ${data?.length || 0} mentors`)
}

async function seedCurriculumItems() {
    console.log("Seeding curriculum items...")

    const items = CURRICULUM_DATA.map((item, index) => ({
        title: item.title,
        description: item.description,
        type: item.type,
        difficulty: item.difficulty,
        skill_domain: item.skill_domain,
        estimated_minutes: item.estimated_minutes,
        display_order: item.display_order ?? index,
        is_active: true,
    }))

    const { data, error } = await supabase
        .from("curriculum_items")
        .upsert(items, { onConflict: "title" })
        .select()

    if (error) {
        console.error("Error seeding curriculum items:", error)
        return
    }

    console.log(`Seeded ${data?.length || 0} curriculum items`)
}

async function main() {
    console.log("Starting Phase 3 data seeding...")

    await seedMentors()
    await seedCurriculumItems()

    console.log("Done!")
}

main().catch(console.error)
