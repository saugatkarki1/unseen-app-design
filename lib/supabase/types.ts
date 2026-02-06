// lib/supabase/types.ts
// ============================================================================
// SUPABASE DATABASE TYPES
// ============================================================================
// These types define the structure of the database tables.
// They are used to provide type safety when using the Supabase client.
// ============================================================================

// Enums for profile fields
export type SkillLevel = "beginner" | "intermediate" | "advanced"
export type TimeCommitment = "casual" | "regular" | "intensive"
export type MotivationType = "career" | "curiosity" | "project" | "other"
export type EngagementTier = "dormant" | "active" | "committed"
export type UserRole = "student" | "mentor"

// Mentor-specific enums
export type MentorExpertise =
    | "Web Development"
    | "Mobile Development"
    | "Data Science"
    | "Game Development"
    | "Backend Engineering"
    | "UI/UX Design"
    | "DevOps"
    | "Cybersecurity"

export type MentorExperienceLevel = "beginner" | "intermediate" | "advanced"
export type MentorAvailability = "casual" | "regular" | "fulltime"

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    // Identity fields (system_generated)
                    id: string
                    email: string | null
                    username: string | null
                    created_at: string | null
                    updated_at: string | null

                    // Public profile fields (user_entered)
                    full_name: string | null
                    preferred_name: string | null
                    bio: string | null
                    avatar_url: string | null

                    // Role & onboarding fields
                    role: UserRole
                    role_selected: boolean
                    onboarding_completed: boolean
                    onboarding_completed_at: string | null

                    // Intent & direction fields (user_entered)
                    institution: string | null
                    learning_direction: string | null
                    learning_goal: string | null // Legacy, kept for compatibility
                    current_skill_level: SkillLevel | null
                    time_commitment: TimeCommitment | null
                    motivation_type: MotivationType | null

                    // Cover customization fields
                    cover_image_url: string | null
                    cover_color: string | null

                    // System-derived fields (derived_later)
                    skill_domain: string | null // Canonical skill domain for curriculum matching
                    inferred_skill_domain: string | null
                    inferred_skill_level: string | null // "Beginner" | "Intermediate" | "Advanced"
                    normalized_learning_goal: string | null
                    onboarding_needs_clarification: boolean | null
                    onboarding_clarification_question: string | null
                    engagement_tier: EngagementTier | null
                    last_active_at: string | null

                    // Mentor-specific onboarding fields
                    mentor_expertise: string[] | null
                    mentor_experience_level: string | null
                    mentor_availability: string | null
                    mentor_motivation: string | null
                    mentor_onboarding_completed: boolean | null
                    mentor_onboarding_completed_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    username?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    full_name?: string | null
                    preferred_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    role?: UserRole
                    role_selected?: boolean
                    onboarding_completed?: boolean
                    onboarding_completed_at?: string | null
                    institution?: string | null
                    learning_direction?: string | null
                    learning_goal?: string | null
                    current_skill_level?: SkillLevel | null
                    time_commitment?: TimeCommitment | null
                    motivation_type?: MotivationType | null
                    cover_image_url?: string | null
                    cover_color?: string | null
                    skill_domain?: string | null
                    inferred_skill_domain?: string | null
                    inferred_skill_level?: string | null
                    normalized_learning_goal?: string | null
                    onboarding_needs_clarification?: boolean | null
                    onboarding_clarification_question?: string | null
                    engagement_tier?: EngagementTier | null
                    last_active_at?: string | null

                    // Mentor-specific onboarding fields
                    mentor_expertise?: string[] | null
                    mentor_experience_level?: string | null
                    mentor_availability?: string | null
                    mentor_motivation?: string | null
                    mentor_onboarding_completed?: boolean | null
                    mentor_onboarding_completed_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    username?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    full_name?: string | null
                    preferred_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    role?: UserRole
                    role_selected?: boolean
                    onboarding_completed?: boolean
                    onboarding_completed_at?: string | null
                    institution?: string | null
                    learning_direction?: string | null
                    learning_goal?: string | null
                    current_skill_level?: SkillLevel | null
                    time_commitment?: TimeCommitment | null
                    motivation_type?: MotivationType | null
                    cover_image_url?: string | null
                    cover_color?: string | null
                    skill_domain?: string | null
                    inferred_skill_domain?: string | null
                    inferred_skill_level?: string | null
                    normalized_learning_goal?: string | null
                    onboarding_needs_clarification?: boolean | null
                    onboarding_clarification_question?: string | null
                    engagement_tier?: EngagementTier | null
                    last_active_at?: string | null

                    // Mentor-specific onboarding fields
                    mentor_expertise?: string[] | null
                    mentor_experience_level?: string | null
                    mentor_availability?: string | null
                    mentor_motivation?: string | null
                    mentor_onboarding_completed?: boolean | null
                    mentor_onboarding_completed_at?: string | null
                }
            }
            onboarding_responses: {
                Row: {
                    id: string
                    user_id: string
                    step_key: string
                    question_key: string
                    response_value: string
                    response_metadata: Record<string, unknown>
                    submitted_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    step_key: string
                    question_key: string
                    response_value: string
                    response_metadata?: Record<string, unknown>
                    submitted_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    step_key?: string
                    question_key?: string
                    response_value?: string
                    response_metadata?: Record<string, unknown>
                    submitted_at?: string
                }
            }
            mentors: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    avatar_url: string | null
                    bio: string | null
                    specializations: string[]
                    is_active: boolean
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    avatar_url?: string | null
                    bio?: string | null
                    specializations?: string[]
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    avatar_url?: string | null
                    bio?: string | null
                    specializations?: string[]
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            user_mentor: {
                Row: {
                    id: string
                    user_id: string
                    mentor_id: string
                    assigned_at: string | null
                    assignment_reason: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    mentor_id: string
                    assigned_at?: string | null
                    assignment_reason?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    mentor_id?: string
                    assigned_at?: string | null
                    assignment_reason?: string | null
                }
            }
            curriculum_items: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    type: "video" | "reading" | "exercise" | "project"
                    difficulty: "Beginner" | "Intermediate" | "Advanced"
                    estimated_minutes: number
                    skill_domain: string
                    display_order: number
                    is_active: boolean
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    type: "video" | "reading" | "exercise" | "project"
                    difficulty: "Beginner" | "Intermediate" | "Advanced"
                    estimated_minutes?: number
                    skill_domain: string
                    display_order?: number
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    type?: "video" | "reading" | "exercise" | "project"
                    difficulty?: "Beginner" | "Intermediate" | "Advanced"
                    estimated_minutes?: number
                    skill_domain?: string
                    display_order?: number
                    is_active?: boolean
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            user_curriculum: {
                Row: {
                    id: string
                    user_id: string
                    curriculum_item_id: string
                    status: "assigned" | "in_progress" | "completed"
                    assigned_at: string | null
                    started_at: string | null
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    curriculum_item_id: string
                    status?: "assigned" | "in_progress" | "completed"
                    assigned_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    curriculum_item_id?: string
                    status?: "assigned" | "in_progress" | "completed"
                    assigned_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                }
            }
            mentor_notes: {
                Row: {
                    id: string
                    mentor_id: string
                    learner_id: string
                    note: string | null
                    next_focus: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    learner_id: string
                    note?: string | null
                    next_focus?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    learner_id?: string
                    note?: string | null
                    next_focus?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type OnboardingResponse = Database["public"]["Tables"]["onboarding_responses"]["Row"]
export type OnboardingResponseInsert = Database["public"]["Tables"]["onboarding_responses"]["Insert"]
export type OnboardingResponseUpdate = Database["public"]["Tables"]["onboarding_responses"]["Update"]

// Mentor types
export type Mentor = Database["public"]["Tables"]["mentors"]["Row"]
export type MentorInsert = Database["public"]["Tables"]["mentors"]["Insert"]
export type MentorUpdate = Database["public"]["Tables"]["mentors"]["Update"]

// User-Mentor assignment types
export type UserMentor = Database["public"]["Tables"]["user_mentor"]["Row"]
export type UserMentorInsert = Database["public"]["Tables"]["user_mentor"]["Insert"]
export type UserMentorUpdate = Database["public"]["Tables"]["user_mentor"]["Update"]

// Curriculum item types
export type CurriculumItem = Database["public"]["Tables"]["curriculum_items"]["Row"]
export type CurriculumItemInsert = Database["public"]["Tables"]["curriculum_items"]["Insert"]
export type CurriculumItemUpdate = Database["public"]["Tables"]["curriculum_items"]["Update"]

// User curriculum types
export type UserCurriculum = Database["public"]["Tables"]["user_curriculum"]["Row"]
export type UserCurriculumInsert = Database["public"]["Tables"]["user_curriculum"]["Insert"]
export type UserCurriculumUpdate = Database["public"]["Tables"]["user_curriculum"]["Update"]

// Curriculum status type
export type CurriculumStatus = "assigned" | "in_progress" | "completed"

// Curriculum type
export type CurriculumType = "video" | "reading" | "exercise" | "project"

// Curriculum difficulty
export type CurriculumDifficulty = "Beginner" | "Intermediate" | "Advanced"

// Mentor notes types
export type MentorNote = Database["public"]["Tables"]["mentor_notes"]["Row"]
export type MentorNoteInsert = Database["public"]["Tables"]["mentor_notes"]["Insert"]
export type MentorNoteUpdate = Database["public"]["Tables"]["mentor_notes"]["Update"]

// Mentor dashboard learner view (combined data for dashboard display)
export interface MentorLearnerView {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    skill_domain: string | null
    inferred_skill_level: string | null
    learning_goal: string | null
    onboarding_completed: boolean
    onboarding_completed_at: string | null
    last_activity_at: string | null
    curriculum_started: boolean
    curriculum_count: number
    note: string | null
    next_focus: string | null
}

// Mentor profile type for onboarding
export interface MentorProfile {
    id: string
    email: string | null
    username: string | null
    full_name: string | null
    institution: string | null
    mentor_expertise: string[]
    mentor_experience_level: MentorExperienceLevel | null
    mentor_availability: MentorAvailability | null
    mentor_motivation: string | null
    mentor_onboarding_completed: boolean
    mentor_onboarding_completed_at: string | null
}

// Mentor onboarding status type
export interface MentorOnboardingStatus {
    isComplete: boolean
    completedAt: string | null
    missingFields: string[]
    profile: Partial<MentorProfile> | null
}
