# EdWeiss - Education Reinvented
<br>
<p align="center">
    <img src="https://github.com/user-attachments/assets/e99269de-b772-4064-8a23-1c5cc9cfa896" width="480">
</p>
<br><br>


## 🔍 A few observations
In high school, students benefit from a more interactive learning environment, which allows for better follow-up by teachers, enhanced knowledge retention, and self-assessment opportunities. However, when transitioning to university, class sizes dramatically increase, often from around 20 students to over 300. This shift brings several challenges:

### For students:
Many experience anxiety about interacting in large classes, leading to a disconnect and difficulty in fully absorbing knowledge due to the lack of engagement. Study methods also change drastically between high school and higher studies.

### For professors:
They lose visibility and direct interaction with individual students, making it difficult to track class progress, gauge how long students need to complete tasks, or offer personalized support.

To address these challenges, several learning tools and organization platforms exist, but they don’t communicate with one another, leading to a fragmented experience. For instance, universities have multiple systems for:<br>
-Course creation and broadcasting (PowerPoint, PDFs, Moodle)<br>
-Collaborative Platform (EdDiscussion, Kami, Padlet, SpeakUp)<br>
-Note-taking and in-class interaction (Notion, OneNote, PaperNote.)<br>
-Scheduling and room management (Google Calendar, Room Occupancy)

# 🌼 What is EdWeiss?

To overcome these challenges, we propose the creation of EdWeiss, a comprehensive "super app" that integrates these various functionalities using a modular approach.

## Modules description

A module is a tool that is developped as a separate unit. Each module represents a different functionality of EdWeiss, and brought together, create the complete application. Here is a list of our features:

| Feature  |  Description |Sensors used | Connectivity |
|---|---|---|---|
| ShowTime!  | An easy to use slide creation tool. Professors can add in-slide quizzes, that students can answer on their phone, when the slide comes up during lecture.  | GPS,Microphone,Camera ,(Gyroscope)| Mixed|
| Action!  | A tool to create game-like quizzes. Quizzes can be assigned at a specific time or used in slides. Professors can then gauge how well the students did.  | Microphone |Mixed|
| Memento!  | A flash-card creation tool. Both students and professors can benefit from it.  |Camera| Offline|
|HandsUp!| Schedule questions during exercise sessions using queueing principles. Resolve student’s issues with long waits, and helps TAs circulate so that small question are prioritized after some time.| N/A | Online|
|Collaboard!| A virtual whiteboard. Students can share them with their friends, to study and take notes together. Place a board on a map, and instantly connect when near, via GPS.| GPS, Camera | Online|
|TimesUp!| An agenda that is linked with the other modules, to be notified of upcoming deadlines. Subscribe to the club you are a part of, to stay up to date to any event you like. Incorporates a to-do list.| N/A | Mixed |
|And many others!| Pomodoro, restaurant advisor ...| GPS | Mixed|
<br>
See Scrumboard for user stories and more informations about modules.

## 📱 The Application
This is the main Android and iOS EdWeiss app, we are using React Native with Expo benefiting its massive ecosystem of libraries and utilities.

To start the application, install the Expo development build on [Expo website](https://www.expo.dev/) then run one of the "Start application" VSCode tasks (or alternatively, use `npx expo start` directly in the `edweiss-app` folder).

## 🔥 EdWeiss Firebase
This is the EdWeiss backend, using Google's Firebase cloud infrastructure. We use Cloud Functions for all our sensitive business logic (basically any write to the database) for security and planning reasons.

To deploy the functions to the Cloud, run the "Deploy functions" VSCode task (or alternatively, use `firebase deploy --only functions` directly in the `edweiss-functions` folder).

## 🧊 EdWeiss Model
This represents all the core types and functions of the app, any changes to this folder should be updated using the "Update model" task.

## 🛠️ Recommended VSCode extensions

`Expo Tools` to get intellisense for Expo config.

`Git Graph` to view the branches and commit history.

`Git Lens` to have better Git implementation (see who modified each line).

`Jest` to be able to run tests from each file more easily.

Also, please turn on VSCode formatting !

## 📋 Branch Naming Conventions

- _**feature**/feature-name_  :  This type of commit indicates the addition of a new feature to the code. It can be a major or minor new feature.
  
- _**bugfix**/issue-number_  :  Used when a bug fix is made. It solves an existing problem in the code.
  
- _**documentation**/documented-feature-name_  :  This type is used for documentation-related changes. It does not involve changes to the source code, but rather to README files, comments or other documents.
  
- _**codestyle**/reformated-feature-name_  :  Represents formatting changes that do not affect the logic of the code. This includes the correction of indentation, the addition or deletion of spaces, or formatting adjustments in the code.
  
- _**refractoring**/modified_structure_  :  Used when you modify the structure of the code without changing its behavior. This is typically done to improve readability, maintainability or code architecture.
  
- _**tests**/[unit , ui]/tested-element_  :  This concerns additions or modifications to tests. This includes writing new tests, modifying existing tests, or correcting tests.
  
- _**chore**/dependancies_  :  Used for changes that do not concern functionality or bug fixes or bug fixes, but are necessary for the project to run smoothly. This may include updates to dependencies, configurations or scripts.

## 📚 Ressources
Check our [Figma](https://www.figma.com/design/BBD2dqgIbEF96IhNpyv7MW/EdWeiss?node-id=0-1&t=qQd63l3nEltoppuT-1) design.
