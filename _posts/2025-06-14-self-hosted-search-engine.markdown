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

So, with that in mind, it all suddenly feels a bit creepy considering I just want to search for the opening hours of the local ramen place. Which brings us to one of the private alternatives: self-hosting a privacy-focused search engine.

In my home-office, I have a NAS (Network Attached Storage) on which I host a variety of software services for use while at home. One afternoon, a couple of things caught my attention. The first was that a service called Tailscale would let me easily access all of the services on my NAS from my devices even when away from home. The second was coming across the code for a privacy-focused search engine called SearXNG that could be deployed in a container. Putting those two things together I found that I suddenly had my very own search engine. I am saving my deeper dive into both containers and Tailscale for another post, so for now I will give a high level overview of what is happening when I do an internet search on my phone: 

- Phone -> Tailscale -> NAS -> SearXNG (container) -> Search results

SearXNG is a meta search engine, meaning that it can search through the results from a range of other search engines and return a selection of those. Looking into the documentation I learned that there are a handful of shortcuts to customise the search like `!wp` to search within wikipedia, `!ddg` to use the DuckDuckGo engine or `!osm` to search locations using Open Street Maps. It turns out that many search engines have some of these tricks, but it took me setting this up to realise. Also, these options are available in a preferences menu whenever I need it. As my first set of search results came in, I found that it was strangely refreshing. No AI summary or sponsored links; nothing about what other people ask or carousels of suggested youtube videos - just a list of website links that suited my search terms.

My search is over - this is how I will be finding information from now on.

Edit 19-06-2025: This note is especially for book-lovers. I just tried out [Talpa Search](https://www.talpasearch.com./search) and wanted to share it with you. This is a great example of how good search can be if the core incentive is based purely on it being a good search.

Links:
- [Google Tracker Beeper](https://berthub.eu/articles/posts/tracker-beeper/)
- [SearXNG Documentation](https://docs.searxng.org/)
