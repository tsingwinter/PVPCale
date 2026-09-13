@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [PVPVECale] 未检测到 Node.js，无法启动。
  echo 请安装 Node.js 后重试，或使用 PVPVECale.exe 桌面版。
  echo 下载地址: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo 正在启动 PVPVECale ...
start "" /min cmd /c "node "%~dp0launcher\server.cjs""
timeout /t 1 /nobreak >nul
echo 已在浏览器中打开。关闭本窗口不影响使用。
timeout /t 2 /nobreak >nul
