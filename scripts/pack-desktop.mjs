import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const builderOut = join(root, 'release-desktop')
const unpackedDir = join(builderOut, 'win-unpacked')
const releaseRoot = join(root, 'release')
const desktopDir = join(releaseRoot, 'PVPCale-电脑版')
const templateDir = join(root, 'scripts', 'desktop-template')
const desktopZip = join(releaseRoot, 'PVPCale-电脑版.zip')

if (!existsSync(unpackedDir)) {
  console.error('未找到桌面版构建产物，请先运行: npm run build:desktop')
  process.exit(1)
}

rmSync(desktopDir, { recursive: true, force: true })
mkdirSync(desktopDir, { recursive: true })
cpSync(unpackedDir, desktopDir, { recursive: true })
cpSync(join(templateDir, '双击启动.bat'), join(desktopDir, '双击启动.bat'))
cpSync(join(templateDir, '安装更新.bat'), join(desktopDir, '安装更新.bat'))
cpSync(join(templateDir, '安装 PVPCale.bat'), join(desktopDir, '安装 PVPCale.bat'))
cpSync(join(templateDir, '安装 PVPCale.vbs'), join(desktopDir, '安装 PVPCale.vbs'))
cpSync(join(templateDir, '使用说明.txt'), join(desktopDir, '使用说明.txt'))

const setupExe = readdirSync(builderOut).find((name) => name.startsWith('PVPCale-Setup-') && name.endsWith('.exe'))
if (setupExe) {
  cpSync(join(builderOut, setupExe), join(releaseRoot, setupExe))
  cpSync(join(builderOut, setupExe), join(desktopDir, setupExe))
}

if (process.platform === 'win32') {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${desktopDir}' -DestinationPath '${desktopZip}' -Force"`,
    { stdio: 'inherit' },
  )
}

console.log(`电脑版文件夹: ${desktopDir}`)
if (setupExe) console.log(`安装程序（推荐）: ${join(releaseRoot, setupExe)}`)
if (existsSync(desktopZip)) console.log(`压缩包（备用）: ${desktopZip}`)
