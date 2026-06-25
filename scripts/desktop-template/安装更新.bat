@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

set "SOURCE=%~dp0"
set "TARGET=%LOCALAPPDATA%\PVPCale"

echo.
echo ========================================
echo   PVPCale 安装 / 更新
echo ========================================
echo.
echo 安装位置: %TARGET%
echo.

:: 关闭正在运行的旧版
echo [1/3] 关闭正在运行的 PVPCale ...
taskkill /IM PVPCale.exe /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: 复制文件到固定目录（覆盖旧文件）
echo [2/3] 正在安装 / 更新文件 ...
if not exist "%TARGET%" mkdir "%TARGET%"

robocopy "%SOURCE%" "%TARGET%" /E /XF "安装更新.bat" /NFL /NDL /NJH /NJS /nc /ns /np >nul
if %ERRORLEVEL% GEQ 8 (
  echo 复制失败，请检查磁盘空间或权限。
  pause
  exit /b 1
)

:: 创建桌面快捷方式
echo [3/3] 创建桌面快捷方式 ...
powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop') + '\PVPCale.lnk'); $s.TargetPath='%TARGET%\PVPCale.exe'; $s.WorkingDirectory='%TARGET%'; $s.Save()" >nul 2>&1

echo.
echo 安装 / 更新完成！
echo 以后请从桌面「PVPCale」快捷方式启动。
echo.
start "" "%TARGET%\PVPCale.exe"
timeout /t 2 /nobreak >nul
