
chmod +w ../edweiss-app/model/*
cp -r "model" "../edweiss-app/"
chmod -w ../edweiss-app/model/*
echo "Model updated in application."

chmod +w ../edweiss-functions/functions/src/model/*
cp -r "model" "../edweiss-functions/functions/src/"
chmod -w ../edweiss-functions/functions/src/model/*
echo "Model updated in cloud functions."
