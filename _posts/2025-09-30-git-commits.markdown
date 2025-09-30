---
layout: post
title:  "Visualising blog metrics"
tags: git visualisation
excerpt_separator: <!--more-->
chart_js: "/assets/js/git_commits.js"
links:
    - link:
        title: d3.js
        url: https://d3js.org/
    - link:
        title: Your life in weeks (Wait But Why)
        url: https://waitbutwhy.com/2014/05/life-weeks.html
    - link:
        title: Word Clouds considered harmful (Jacob Harris - Niemen Lab)
        url: https://www.niemanlab.org/2011/10/word-clouds-considered-harmful/
    - link:
        title: JR East rail maps
        url: https://www.jreast.co.jp/en/multi/downloads/
---
### Charts are more fun when you build them yourself
<!--more-->

I love visualisations. There is something special about a simple visual representation of data that manages to clearly convey an insight, tell a story or neatly present otherwise complex information. [This post by Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html) presents the amount of time in our lives in a novel and digestible form. On the opposite end of the spectrum, [this article by Jacob Harris](https://www.niemanlab.org/2011/10/word-clouds-considered-harmful/) highlights how bad some visualisations can be when they aren't tailored to the context of the data or the insights available from it.

Hanging on the back wall of my office, I have a large print of this [JR-East rail map](https://www.jreast.co.jp/e/info/map_a4ol.pdf), which captures a staggering amount of information, in a way that allows a layperson (even someone from a different country) to view and then work out how to navigate around Tokyo. It is a long way from being a scale map of the rail network, but rather a distilled representation of what the commuter needs to know.

My work as a programmer has required me to create custom visualisations, in an effort to unravel the stories locked tightly within loads of incomprehensible data. To do this, I use [d3.js](https://d3js.org). Rather than extol the virtues of d3, I have decided to indulge myself in creating some visualisations specifically for this post. These intentionally break many of the "rules" of good charts like omitting titles, axes and legends, as they are there to serve as an example of d3.js that is aesthetically pleasing without derailing the train of thought with insights from the data.

Each chart has some kind of simple interaction availble, either directly or via an external control. The contents of the chart will change over time, as the data feeding into the charts is automatically updated. Importantly, the charts have been great fun to create. If you are particularly curious, I have included the raw data in a panel below the charts.

If there are any visualisations that you have found profound in one way or another, feel free to share it with me via the email down below.
