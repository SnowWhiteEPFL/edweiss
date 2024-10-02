
GREEN='\033[0;32m'
NC='\033[0m'
BOLD=$(tput bold)

rm -rf ../edweiss-app/model/
cp -r "src/." "../edweiss-app/model/"
find ../edweiss-app/model/ -type f -exec bash -c 'chmod -w "{}"' \;
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in application.\n"

rm -rf ../edweiss-web/src/model/
cp -r "src/." "../edweiss-web/src/model/"
find ../edweiss-web/src/model/ -type f -exec bash -c 'chmod -w "{}"' \;
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in web application.\n"

rm -rf ../edweiss-firebase/functions/src/model/
cp -r "src/." "../edweiss-firebase/functions/src/model/"
find ../edweiss-firebase/functions/src/model/ -type f -exec bash -c 'chmod -w "{}"' \;
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Model updated in cloud functions.\n"

printf "\n"
