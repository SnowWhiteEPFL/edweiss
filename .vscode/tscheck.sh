
GREEN='\033[0;32m'
NC='\033[0m'
RESET='\x1b[0m'
BOLD=$(tput bold)

cd ../edweiss-app
npm run tscheck
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Typescript checked in application.${RESET}\n"

cd ../edweiss-firebase/functions
npm run tscheck
printf "${GREEN} \xE2\x9C\x94 ${NC} ${BOLD} Typescript checked in cloud functions.${RESET}\n"

printf "\n"
