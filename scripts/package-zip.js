// package-zip.js — Clean ZIP export for hackathon submission (Phase 12.3).
//
// Packs project files into submission.zip, omitting:
// - node_modules
// - .git
// - .env and sensitive secrets
// - build artifacts (dist, .temp, log files)
//
// Usage: node scripts/package-zip.js

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = process.cwd()
const OUT_ZIP = path.join(ROOT, 'personalized-learning-path-recommender-submission.zip')

console.log('Creating clean submission ZIP archive...')

try {
  if (fs.existsSync(OUT_ZIP)) {
    fs.unlinkSync(OUT_ZIP)
  }

  // Use git archive to export all tracked clean files into zip
  console.log('Packaging git tracked files...')
  execSync(`git archive -o "${OUT_ZIP}" HEAD`, { stdio: 'inherit' })

  if (fs.existsSync(OUT_ZIP)) {
    const stats = fs.statSync(OUT_ZIP)
    console.log(`Successfully created clean ZIP: ${OUT_ZIP} (${(stats.size / 1024).toFixed(1)} KB)`)
  } else {
    console.warn('Archive finished without creating output file.')
  }
} catch (err) {
  console.error('Failed to create ZIP package:', err)
}
