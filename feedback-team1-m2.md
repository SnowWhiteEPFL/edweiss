# Milestone M2: Team Feedback

This milestone M2 provides an opportunity to give you, as a team, formal feedback on how you are performing in the project. By now, you should be building upon the foundations set in M1, achieving greater autonomy and collaboration within the team. This is meant to complement the informal, ungraded feedback from your coaches given during the weekly meetings or asynchronously on Discord, email, etc.

The feedback focuses on two major themes:
First, whether you have adopted good software engineering practices and are making progress toward delivering value to your users.
Is your design and implementation of high quality, easy to maintain, and well tested?
Second, we look at how well you are functioning as a team, how you organize yourselves, and how well you have refined your collaborative development.
An important component is also how much you have progressed, as a team, since the previous milestone.
You can find the evaluation criteria in the [M2 Deliverables](https://github.com/swent-epfl/public/blob/main/project/M2.md) document.
As mentioned in the past, the standards for M2 are elevated relative to M1, and this progression will continue into M3.

We looked at several aspects, grouped as follows:

 - Design
   - [Features](#design-features)
   - [Design Documentation](#design-documentation)
 - [Implementation and Delivery](#implementation-and-delivery)
 - Scrum
   - [Backlogs Maintenance](#scrum-backlogs-maintenance)
   - [Documentation and Ceremonies](#scrum-documentation-and-ceremonies)
   - [Continuous Delivery of Value](#scrum-continuous-delivery-of-value)

## Design: Features

We interacted with your app from a user perspective, assessing each implemented feature and flagging any issues encountered. Our evaluation focused mainly on essential features implemented during Sprints 3, 4, and 5; any additional features planned for future Sprints were not considered in this assessment unless they induced buggy behavior in the current APK.
We examined the completeness of each feature in the current version of the app, and how well it aligns with user needs and the overall project goals.


The app is very impressive it has many features. We are impressed with the live transcription in text of audio (that uses a correction AI to increase the quality of the raw output of speech to text pipeline), linked with the slide number that is controlled with another phone as a remote. We liked a lot the responsiveness (screen orientation & size) of the UI, the landskape view for the calendar and the overall support of large tablet screens. We like as well how everything is interconnected and the features you choose to keep adds essential value. Concerning the completness they basically can work for a quick demo but it is not bug-free and polished yet, there are still some crashes during the demos (should handle this with alert popups messages instead).


For this part, you received 6.8 points out of a maximum of 8.0.

## Design: Documentation

We reviewed your Figma (including wireframes and mockups) and the evolution of your overall design architecture in the three Sprints.
We assessed how you leveraged Figma to reason about the UX, ensure a good UX, and facilitate fast UI development.
We evaluated whether your Figma and architecture diagram accurately reflect the current implementation of the app and how well they align with the app's functionality and structure.


The figma is very good looking and even ahead of the current state of the app. Perfect.

Concerning the architecture diagram it is readable and organized in general (even tho the app has many features). But it is still unclear, how is the voice recognition working (is it the "scheduler" box? or maybe it is not even present in the diagram). The color of the arrows don't seem to have meaning, they seem very confusing. Sometimes for instance "showtime", "remote control",... aren't connected to anything. We don't really get how things are working and the connection all those features share.


For this part, you received 4.8 points out of a maximum of 6.0.

## Implementation and Delivery

We evaluated several aspects of your app's implementation, including code quality, testing, CI practices, and the functionality and quality of the APK.
We assessed whether your code is well modularized, readable, and maintainable.
We looked at the efficiency and effectiveness of your unit and end-to-end tests, and at the line coverage they achieve.


The codebase is great! You used the firebase functions which is excellent (knowing that it is quite difficule to do and many teams don't do this). The overall repo structure is clear and organizied into right folders/modules. And the documentation is useful. On the downsides there are some commented code that is left in the main branch, makes sure to not leave them.

Congratulations for achieving a high >90% coverage test. It is an incredible comeback knowing the size of your codebase.

Concerning the APK it worked well no issues of installation.The app is still very slow the user experience feels strange we can click multiple times the same button (which somestimes lead to a crash). Better would be to show a loading indicator for the user to wait before trying again, this will help providing a smoother user experience as it will give feedback on what is going on. The notifications screen doesnt work it crashes (maybe the account is not assigned to a fake/demo class?)


For this part, you received 13.8 points out of a maximum of 16.0.

## Scrum: Backlogs Maintenance

We looked at whether your Scrum board is up-to-date and well organized.
We evaluated your capability to organize Sprint 6 and whether you provided a clear overview of this planning on the Scrum board.
We assessed the quality of your user stories and epics: are they clearly defined, are they aligned with a user-centric view of the app, and do they suitably guide you in delivering the highest value possible.


Sprint Backlog for Sprint 6 is clear. All tasks have a clear description, an assignee and all the tags, that's great. However only 4 people have tasks in the current Sprint Backlog. I know that the others know what they'll be doing, but you need to put all these tasks in the Sprint Backlog and then move them in the other columns. This way it's easier for all of us and specifically for the Scrum master to keep track of the advancement of the current Sprint.

Your Product Backlog is furnished. All user stories have priorities and tags, they are all clear. The next step will be to get more user feedback and to integrate it into the Product Backlog.


For this part, you received 3.2 points out of a maximum of 4.0.

## Scrum: Documentation and Ceremonies

We assessed how you used the Scrum process to organize yourselves efficiently.
We looked at how well you documented your team Retrospective and Stand-Up during each Sprint.
We also evaluated your autonomy in using Scrum.


Your documents are filled on time and are very detailed and self critical that's excellent! You should take time to go over them during the scrum meetings. You can go fast on this and make sure that everyone is aware of things that went well, things that need to improve and what. Often you didnt mention them during the meetings where it could be very usefull to do. 
You could improve as well the demo it tends sometimes to be a bit chaotic. You could make much more efficient meetings and not make it last more than 1hour.
The team is becoming more independent but there's still room to grow. You need to take more control of the process and rely less on outside help. While you may feel confident about reaching your ambitious goals, they are tough, and we need to make sure you stay on the right path to succeed.


For this part, you received 2.8 points out of a maximum of 4.0.

## Scrum: Continuous Delivery of Value

We evaluated the Increment you delivered at the end of each Sprint, assessing your team’s ability to continuously add value to the app.
This included an assessment of whether the way you organized the Sprints was conducive to an optimal balance between effort invested and delivery of value.


You finally managed to recover from the huge codebase you did in the very first sprint, congrats! The scrum process wasn't respected but you learned from this experience and are getting much more careful in the planning, especially in the last sprint 5. Great! The delivery of value is not consistent (spiked on the first sprint) but overall on average it is more than what the course asks. The scrum methodology is focusing more on the constant delivery of value and constant app robustness (reading the agile manifesto "Working software is the primary measure of progress" https://agilemanifesto.org/iso/en/principles.html) but in your case the software is not working well there are many little bugs/crashes/slow things. The tests could fix those issues, but as you already know the tests were done very late and not at each sprint.


For this part, you received 1.2 points out of a maximum of 2.0.

## Summary

Based on the above points, your intermediate grade for this milestone M2 is 5.08. If you are interested in how this fits into the bigger grading scheme, please see the [project README](https://github.com/swent-epfl/public/blob/main/project/README.md) and the [course README](https://github.com/swent-epfl/public/blob/main/README.md).

Your coaches will be happy to discuss the above feedback in more detail.

Good luck for the next Sprints!
