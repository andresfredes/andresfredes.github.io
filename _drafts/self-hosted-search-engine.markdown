---
layout: post
title:  "Self-hosted search"
tags: search searx searxng self-host tailscale
excerpt_separator: <!--more-->
---

It turns out you can have your very own private search engine!
<!--more-->

Over the course of the last few years, I have been slowly reducing my reliance on the few biggest tech companies and moving towards self-hosting my own tech servcies. The most recent change, which turned out to be significantly simpler than I expected, was search. To give an overview of why I was interested in self-hosting search, we first need some context.

The word "Google" has become the culturally accepted term meaning "search the internet". The company Google has been making its income from the search engine of the same name through the use of advertising and the related activities: data collection and user profiling.

When you are on google.com (for example), each click and keypress gets sent to Google along with metadata about the browser and computer that you are using. This information, along with the contents of the search itself, is collected and analysed in order to identify your online profile. This profile is not so much about identifying you in the way that we would usually think about it, but rather to identify you in terms of your online behaviour: what you look at, what you click, how you navigate pages, what you buy through to ultimately, how your future behaviours can be directed. Google's advertising value comes directly from this last point: how well google can direct your future behaviour. Essentially Google collects oodles of data related to who you are online in order to profile you and then attempt to modify your behaviour. I will go into more detail about data collection, profiling and behaviour modification in a future post.

So, with that in mind, it all suddenly feels a bit creepy when I just want to search for the opening hours of the local ramen place. Which brings us a private alternative: self-hosting a privacy-focused search engine.


Links:
- [Google Tracker Beeper](https://berthub.eu/articles/posts/tracker-beeper/)