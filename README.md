# EdWeiss - Education Reinvented
<p align="center">
    <img src="https://github.com/user-attachments/assets/e99269de-b772-4064-8a23-1c5cc9cfa896" width="480">
</p>

## 📱 EdWeiss Application
This is the main Android and iOS EdWeiss app, we are using React Native with Expo benefiting its massive ecosystem of libraries and utilities.

To start the application, install the Expo development build on [Expo website](https://www.expo.dev/) then run one of the "Start application" VSCode tasks (or alternatively, use `npx expo start` directly in the `edweiss-app` folder).

## 🔥 EdWeiss Firebase
This is the EdWeiss backend, using Google's Firebase cloud infrastructure. We use Cloud Functions for all our sensitive business logic (basically any write to the database) for security and planning reasons.

To deploy the functions to the Cloud, run the "Deploy functions" VSCode task (or alternatively, use `firebase deploy --only functions` directly in the `edweiss-functions` folder).

## 🧊 EdWeiss Model
This represents all the core types and functions of the app, any changes to this folder should be updated using the "Update model" task.

## 🛠️ Recommended VSCode extensions
`ES7+ React/Redux/React-Native snippets` to quickly generate React Native code snippet (use `rnfe`).

`Expo Tools` to get intellisense for Expo config.

`Git Graph` to view the branches and commit history.

`Git Lens` to have better Git implementation (see who modified each line).

`Jest` to be able to run tests from each file more easily.

Also, please turn on VSCode formatting !

## 📚 Ressources
Check our [Figma](https://www.figma.com/design/BBD2dqgIbEF96IhNpyv7MW/EdWeiss?node-id=0-1&t=qQd63l3nEltoppuT-1) design.
