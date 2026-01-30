@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars:
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a key stroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------
@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@setlocal
set "MAVEN_BATCH_PAUSE=on"
if "%MAVEN_BATCH_PAUSE%"=="on" set "MAVEN_BATCH_PAUSE="
@REM Always override when set to 'on'
if "%MAVEN_BATCH_ECHO%"=="on"  echo on
@REM set %HOME% to equivalent of $HOME
if "%HOME%"=="" (set "HOME=%HOMEDRIVE%%HOMEPATH%")
@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%"=="" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%HOME%\mavenrc_pre.bat" call "%HOME%\mavenrc_pre.bat"
if exist "%HOME%\mavenrc_pre.cmd" call "%HOME%\mavenrc_pre.cmd"
:skipRcPre
@setlocal
set ERROR_CODE=0
@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal
@REM ==== START VALIDATION ====
if not "%JAVA_HOME%"=="" goto OkJHome
echo.
echo Error: JAVA_HOME not found in your environment. >&2
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation. >&2
echo.
goto error
:OkJHome
if exist "%JAVA_HOME%\bin\java.exe" goto init
echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation. >&2
echo.
goto error
:init
@REM Find the project base dir
set "MA_DIR=%~dp0"
set "MA_DIR=%MA_DIR:~0,-1%"
if "%MA_DIR%"=="" set "MA_DIR=."
set "WRAPPER_JAR=%MA_DIR%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"
set "MAVEN_PROJECTBASEDIR=%MA_DIR%"
@REM DOWNLOAD_WRAPPER
if exist "%WRAPPER_JAR%" goto runMaven
echo Couldn't find "%WRAPPER_JAR%", downloading it ...
echo Downloading from: https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient = New-Object System.Net.WebClient; $webclient.DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%')}"
if exist "%WRAPPER_JAR%" goto runMaven
echo Error: Failed to download maven-wrapper.jar
goto error
:runMaven
@REM Provide a "standard" way to retrieve the specific values
if not "%MAVEN_OPTS%"=="" goto optsInEnv
set "MAVEN_OPTS=-Xmx1024m -Dfile.encoding=UTF-8"
:optsInEnv
set "MAVEN_CMD_LINE_ARGS=%*"
"%JAVA_HOME%\bin\java.exe" %MAVEN_OPTS% -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end
:error
set ERROR_CODE=1
:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%HOME%\mavenrc_post.bat" call "%HOME%\mavenrc_post.bat"
if exist "%HOME%\mavenrc_post.cmd" call "%HOME%\mavenrc_post.cmd"
:skipRcPost
@REM pause the script if MAVEN_BATCH_PAUSE is set to 'on'
if "%MAVEN_BATCH_PAUSE%"=="on" pause
if "%MAVEN_TERMINATE_CMD%"=="on" exit %ERROR_CODE%
exit /B %ERROR_CODE%
