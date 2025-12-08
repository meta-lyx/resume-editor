@echo off
echo Building React app...
cd resume-rewriter
call pnpm build
cd ..

echo Copying build to public folder...
if exist public rmdir /s /q public
mkdir public
xcopy /E /I /Y resume-rewriter\dist\* public\

echo Copying functions to public\functions...
xcopy /E /I /Y functions public\functions

echo Listing public folder structure...
dir public /s /b | findstr /i "\.ts$"

echo Deploying to Cloudflare Pages...
npx wrangler pages deploy public --project-name=ai-resume-editor

echo Done!
pause

