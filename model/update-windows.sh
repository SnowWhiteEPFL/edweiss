
@echo off

rmdir /S /Q ../edweiss-app/model
xcopy "src\." "../edweiss-app/model/" /E /I
for /r ../edweiss-app/model/ %%f in (*) do ( icacls "%%f" /deny *S-1-1-0:(W) )
@echo Model updated in application.

rmdir /S /Q ../edweiss-web/src/model
xcopy "src\." "../edweiss-web/src/model/" /E /I
for /r ../edweiss-web/src/model/ %%f in (*) do ( icacls "%%f" /deny *S-1-1-0:(W) )
@echo Model updated in web application.

rmdir /S /Q ../edweiss-firebase/functions/src/model
xcopy "src\." "../edweiss-firebase/functions/src/model/" /E /I
for /r ../edweiss-firebase/functions/src/model/ %%f in (*) do ( icacls "%%f" /deny *S-1-1-0:(W) )
@echo Model updated in firebase functions.
