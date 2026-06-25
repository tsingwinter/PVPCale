import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const distDir = join(root, 'dist')
const releaseDir = join(root, 'release')
const outputDir = join(releaseDir, 'PVPCale-网页版')
const zipPath = join(releaseDir, 'PVPCale-网页版.zip')
const mobileReadme = join(root, 'scripts', 'mobile-template', '手机使用说明.txt')

if (!existsSync(distDir)) {
  console.error('dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

mkdirSync(releaseDir, { recursive: true })
rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })
cpSync(distDir, outputDir, { recursive: true })
cpSync(mobileReadme, join(outputDir, '手机使用说明.txt'))

if (process.platform === 'win32') {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${outputDir}' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' },
  )
}

console.log(`网页版文件夹: ${outputDir}`)
if (existsSync(zipPath)) console.log(`网页版压缩包: ${zipPath}`)
