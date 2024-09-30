
GREEN='\033[0;32m'
NC='\033[0m'
BOLD=$(tput bold)

chmod +w ../edweiss-app/model/*
cp -r "src/." "../edweiss-app/model/"
chmod -w ../edweiss-app/model/*
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in application.\n"

chmod +w ../edweiss-web/src/model/*
cp -r "src/." "../edweiss-web/src/model/"
chmod -w ../edweiss-web/src/model/*
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in web application.\n"

chmod +w ../edweiss-firebase/functions/src/model/*
cp -r "src/." "../edweiss-firebase/functions/src/model/"
chmod -w ../edweiss-firebase/functions/src/model/*
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in cloud functions.\n\n"
