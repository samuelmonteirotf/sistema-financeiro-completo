#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const filesToCheck = ["public/sitemap.xml", "public/robots.txt", "app/opengraph-image.tsx", "app/icon.tsx"]
const missingFiles = filesToCheck.filter((file) => !fs.existsSync(path.join(projectRoot, file)))

if (missingFiles.length) {
  console.error("🚫 SEO check falhou. Arquivos ausentes:", missingFiles.join(", "))
  process.exit(1)
}

const layoutPath = path.join(projectRoot, "app", "layout.tsx")
const layoutContent = fs.readFileSync(layoutPath, "utf8")
const requiredSnippets = ["canonical", "openGraph", "twitter", "AnalyticsScripts"]

const missingSnippets = requiredSnippets.filter((snippet) => !layoutContent.includes(snippet))

if (missingSnippets.length) {
  console.error("🚫 SEO check falhou. Metadados faltando:", missingSnippets.join(", "))
  process.exit(1)
}

console.log("✅ SEO check: sitemap, robots e metadados encontrados.")
