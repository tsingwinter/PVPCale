@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

set "SOURCE=%~dp0"
set "TARGET=%LOCALAPPDATA%\PVPVECale"

echo.
echo ========================================
echo   PVPVECale 安装 / 更新
echo ========================================
echo.
echo 安装位置: %TARGET%
echo.

:: 关闭正在运行的旧版
echo [1/3] 关闭正在运行的 PVPVECale ...
taskkill /IM PVPVECale.exe /F >nul 2>&1
taskkill /IM PVPCale.exe /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: 复制文件到固定目录（覆盖旧文件）
echo [2/3] 正在安装 / 更新文件 ...
if not exist "%TARGET%" mkdir "%TARGET%"

robocopy "%SOURCE%" "%TARGET%" /E /XF "安装更新.bat" "安装 PVPVECale.bat" "安装 PVPVECale.vbs" /NFL /NDL /NJH /NJS /nc /ns /np >nul
if %ERRORLEVEL% GEQ 8 (
  echo 复制失败，请检查磁盘空间或权限。
  pause
  exit /b 1
)

:: 创建桌面快捷方式
echo [3/3] 创建桌面快捷方式 ...
powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop') + '\PVPVECale.lnk'); $s.TargetPath='%TARGET%\PVPVECale.exe'; $s.WorkingDirectory='%TARGET%'; $s.Save()" >nul 2>&1

echo.
echo 安装 / 更新完成！
echo 以后请从桌面「PVPVECale」快捷方式启动。
echo.
start "" "%TARGET%\PVPVECale.exe"
timeout /t 2 /nobreak >nul
