@echo off

call install-deps.bat

REM Build the React app
call pnpm serve
