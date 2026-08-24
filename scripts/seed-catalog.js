// seed-catalog.js
// Populates the `courses` and `prerequisites` tables with a curated catalog.
// Idempotent: safe to re-run. Matches existing conventions (plain JS, node).
//
// Usage: node scripts/seed-catalog.js
//
// Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env (service role
// writes public catalog data that is not user-owned and has no RLS).

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// ---------------------------------------------------------------------------
// Catalog definition
// ---------------------------------------------------------------------------
// Each course: title, description, domain, difficulty, duration_hours, skills.
// `prerequisiteEdges` maps a course title -> titles that must come first.
// ---------------------------------------------------------------------------

const courses = [
  // --- Data science / Python foundation ---
  {
    title: 'Python Fundamentals',
    description:
      'Core Python syntax, data types, control flow, functions, and file I/O.',
    domain: 'data-science',
    difficulty: 'beginner',
    duration_hours: 20,
    skills: ['python', 'programming-basics'],
  },
  {
    title: 'Data Analysis with Pandas',
    description: 'Load, clean, transform, and analyze tabular data with pandas.',
    domain: 'data-science',
    difficulty: 'intermediate',
    duration_hours: 25,
    skills: ['pandas', 'data-cleaning', 'python'],
  },
  {
    title: 'Data Visualization',
    description: 'Create clear charts and dashboards with matplotlib and seaborn.',
    domain: 'data-science',
    difficulty: 'intermediate',
    duration_hours: 15,
    skills: ['matplotlib', 'seaborn', 'visualization'],
  },
  {
    title: 'Statistics for Data Science',
    description:
      'Descriptive and inferential statistics, probability, and hypothesis testing.',
    domain: 'data-science',
    difficulty: 'intermediate',
    duration_hours: 30,
    skills: ['statistics', 'probability'],
  },
  {
    title: 'Machine Learning Foundations',
    description:
      'Supervised and unsupervised learning with scikit-learn: regression, classification, clustering.',
    domain: 'data-science',
    difficulty: 'intermediate',
    duration_hours: 35,
    skills: ['scikit-learn', 'ml-basics'],
  },
  {
    title: 'Deep Learning with TensorFlow',
    description: 'Neural networks, CNNs, and training workflows with TensorFlow/Keras.',
    domain: 'data-science',
    difficulty: 'advanced',
    duration_hours: 40,
    skills: ['tensorflow', 'neural-networks'],
  },
  {
    title: 'Applied Machine Learning Project',
    description:
      'End-to-end project: build, evaluate, and deploy an ML model on a real dataset.',
    domain: 'data-science',
    difficulty: 'advanced',
    duration_hours: 30,
    skills: ['ml-project', 'model-deployment'],
  },

  // --- Web development ---
  {
    title: 'HTML & CSS Foundations',
    description: 'Semantic HTML, responsive CSS layout, Flexbox, and Grid.',
    domain: 'web-dev',
    difficulty: 'beginner',
    duration_hours: 18,
    skills: ['html', 'css'],
  },
  {
    title: 'JavaScript Essentials',
    description: 'Core JavaScript: variables, functions, arrays, objects, and events.',
    domain: 'web-dev',
    difficulty: 'beginner',
    duration_hours: 22,
    skills: ['javascript', 'frontend-basics'],
  },
  {
    title: 'React Development',
    description:
      'Build interactive single-page apps with React, components, and hooks.',
    domain: 'web-dev',
    difficulty: 'intermediate',
    duration_hours: 30,
    skills: ['react', 'components', 'hooks'],
  },
  {
    title: 'Full-Stack Web Development',
    description:
      'Connect a frontend to a backend API and database to ship a full app.',
    domain: 'web-dev',
    difficulty: 'advanced',
    duration_hours: 40,
    skills: ['backend-apis', 'databases', 'full-stack'],
  },

  // --- Cloud computing ---
  {
    title: 'Cloud Basics with AWS',
    description:
      'Core cloud concepts: compute, storage, networking, and IAM on AWS.',
    domain: 'cloud',
    difficulty: 'beginner',
    duration_hours: 20,
    skills: ['aws', 'cloud-basics'],
  },
  {
    title: 'Serverless Applications',
    description:
      'Design and deploy serverless functions, databases, and auth flows.',
    domain: 'cloud',
    difficulty: 'intermediate',
    duration_hours: 25,
    skills: ['serverless', 'aws', 'cloud-architecture'],
  },
]

const prerequisiteEdges = {
  'Data Analysis with Pandas': ['Python Fundamentals'],
  'Data Visualization': ['Data Analysis with Pandas'],
  'Statistics for Data Science': ['Python Fundamentals'],
  'Machine Learning Foundations': [
    'Python Fundamentals',
    'Data Analysis with Pandas',
    'Statistics for Data Science',
  ],
  'Deep Learning with TensorFlow': [
    'Machine Learning Foundations',
    'Data Analysis with Pandas',
  ],
  'Applied Machine Learning Project': ['Machine Learning Foundations'],
  'JavaScript Essentials': ['HTML & CSS Foundations'],
  'React Development': ['JavaScript Essentials', 'HTML & CSS Foundations'],
  'Full-Stack Web Development': ['React Development'],
  'Serverless Applications': ['Cloud Basics with AWS'],
}
// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------
// Upsert courses by title (idempotent), collect each course's stable id, then
// rebuild the prerequisite edges against those ids.
// ---------------------------------------------------------------------------

console.log('Seeding course catalog...')

const { data: existingRows, error: fetchError } = await supabase
  .from('courses')
  .select('id, title')

if (fetchError) {
  console.error('Failed to fetch existing courses:', fetchError.message)
  process.exit(1)
}

const idByTitle = new Map()
for (const row of existingRows ?? []) {
  idByTitle.set(row.title, row.id)
}

let insertedCount = 0

for (const course of courses) {
  const existingCourse = existingRows?.find((r) => r.title === course.title)
  const { data, error } = existingCourse
    ? await supabase.from('courses').update({
        description: course.description,
        domain: course.domain,
        difficulty: course.difficulty,
        duration_hours: course.duration_hours,
        skills: course.skills,
      }).eq('id', existingCourse.id)
    : await supabase.from('courses').insert({
        title: course.title,
        description: course.description,
        domain: course.domain,
        difficulty: course.difficulty,
        duration_hours: course.duration_hours,
        skills: course.skills,
      })

  if (error) {
    console.error(`Failed to write course "${course.title}":`, error.message)
    process.exit(1)
  }

  const row = Array.isArray(data) ? data[0] : data
  const courseId = row?.id ?? existingCourse?.id
  if (courseId) idByTitle.set(course.title, courseId)

  insertedCount += 1
  console.log(
    existingCourse
      ? `  updated course: ${course.title}`
      : `  inserted course: ${course.title}`
  )
}

// Re-fetch all course ids by title so edge resolution is reliable regardless
// of what PostgREST returns from the insert/update calls above.
const { data: afterRows, error: refetchError } = await supabase
  .from('courses')
  .select('id, title')

if (refetchError) {
  console.error('Failed to re-fetch courses:', refetchError.message)
  process.exit(1)
}

idByTitle.clear()
for (const row of afterRows ?? []) {
  idByTitle.set(row.title, row.id)
}

// Rebuild prerequisite edges (clear then re-insert).
// `prerequisites` has no `id` column (PK = course_id pair), so filter on
// course_id with a sentinel UUID that matches nothing to delete all rows.
const { error: deleteEdgesError } = await supabase
  .from('prerequisites')
  .delete()
  .neq('course_id', '00000000-0000-0000-0000-000000000000')

if (deleteEdgesError) {
  console.error('Failed to clear prerequisite edges:', deleteEdgesError.message)
  process.exit(1)
}

let edgeCount = 0
for (const [courseTitle, prereqTitles] of Object.entries(prerequisiteEdges)) {
  const courseId = idByTitle.get(courseTitle)
  if (!courseId) {
    console.error(`Skipping edges for unknown course "${courseTitle}"`)
    continue
  }
  for (const prereqTitle of prereqTitles) {
    const prereqId = idByTitle.get(prereqTitle)
    if (!prereqId) {
      console.error(`Skipping unknown prerequisite "${prereqTitle}"`)
      continue
    }
    const { error } = await supabase.from('prerequisites').insert({
      course_id: courseId,
      prerequisite_course_id: prereqId,
    })
    if (error) {
      console.error(
        `Failed to add edge ${courseTitle} <- ${prereqTitle}:`,
        error.message
      )
      process.exit(1)
    }
    edgeCount += 1
  }
}

console.log(
  `\nDone. ${insertedCount} courses upserted, ${edgeCount} prerequisite edges created.`
)
