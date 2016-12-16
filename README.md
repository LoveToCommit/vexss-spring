# vexss-spring
Vendor Expert Support System (VExSS) - Elasticsearch Prototype - Spring Domain.

# WHAT
VExSS was a prototype I developed in 2015 when I was experimenting with Elasticsearch on Windows 10 OS. That version was highly customized to work with SAP Process Integration, Orchestration, and Systems Integration topics specific to the SAP domain. For security reasons, I cannot upload Note data that I would have used as an open ecosystem partner. As with Vendelligence, I wanted to extend it beyond that initial vendor or open source project domain for experimental purposes.

This version targets the general Spring projects domain.

This prototype does not use the same BOOST settings and other configurations intended to optimize the search results that I used in the
prototype from 2015, which was focusing on SAP. As I am working with a new release of Elasticsearch, I want to research any changes
or new options in the settings and use it as a stepping stone to creating a simple expert system
over targeted information domains, derived from the Vendelligence project.

## WHY
I wanted a dedicated expert system to support me if doing my own open source project (OSP) work or providing vendor services. I wanted a formal
data structure on my own notes and a way to index them using an open source search solution. VExSS focuses on a single vendor or OSP.

Vendelligence targets the EXTERNAL web using the Google Custom Search JSON API. I needed a solution that worked with the INTERNAL data
storage mechanism I had deliberately designed into Vendelligence - the Query Model class. VExSS would be an initial solution prototype.
It uses Elasticsearch because:
* (a) it's easy to install and configure, 
* (b) can handle high volume data, 
* (c) is near-real-time and 
* (d) is open source so we don't have to rely on external vendor APIs with pricey fees. We get enough horsepower that we can adapt it to our needs.

Note: The reason there are so many extra flag-type JSON fields and label categories is I knew I would create a lot of these files per Vendor or Open Source Project (OSP). And I need a lot of these files to have any chance of getting useful output from machine learning frameworks. Last week, I started research into the Google Sentiment Analysis and Natural Language Processing APIs. Most require labels and methods to train the system on the data samples, based on the documentation and tutorials I read, so I'll use these as a starting point.

## PRECONDITIONS
1. elasticsearch runs on localhost:9200
2. kibana runs on localhost:5601
3. elasticsearch.yml has following additional entries:

```
#add below properties to avoid access-control-allow-origin errors in browser developer tools console
http.cors.enabled: true
http.cors.allow-origin: "*"
```
4. You have an HTTP server running. In my case, I use a Homebrew installation of Apache HTTP Server. Once it's running, you should
be able to drop in the vexss-client folder directly into it and immediately load the index.html using this path e.g.
```
http://localhost:80/vexss-client
```

## INSTALLATION INSTRUCTIONS
1. Install Elasticsearch
https://www.elastic.co/downloads/elasticsearch
2. Install Kibana (not mandatory as you can use command line console on elasticsearch, but it's helpful)
https://www.elastic.co/downloads/kibana
3. Install HTTP server (Apache, NGINX, etc.)
https://httpd.apache.org/
or
https://www.nginx.com/resources/wiki/
4. Install Elasticsearch Javascript Client - My build contains a copy of the latest release, but you might want the minified version
https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html
5. Build the index - you can run each of the JSON files within vexss-index-spring-boot directly in the Kibana - Dev Tools UI
https://www.elastic.co/guide/en/elasticsearch/reference/current/_index_and_query_a_document.html
6. Drop the vexss-client folder into your HTTP server
7. Hit localhost:80/vexss-client
8. Set up a cp script that has authorization to copy a directory from your workspace directory (Eclipse-Neon in my case) to the target apache http server directory. This lets you do live reloading when you make updates to the build. Alternatively run directly in the IDE of choice.

## EXAMPLE
Select * Data Architecture radio button and enter search string like "database support"

## FAQ
### 1. Why do you have queryTopicVariants defined?
To allow for variations in queries the way I ask them myself or the way a client used to ask me questions. Two people might be asking the same thing but phrase it quite differently. Remember, this is intended to be plugged into machine learning APIs, so we need to give the system something concrete to work with in a prototype.

### 2. Why is the textarea so big - why not just a search panel?
This is deliberately a single-page-application. When I created the initial prototypes in 2015, I also used a voice-plugin for
some browsers, but the speech interaction annoyed me because it was clunky and command-oriented and unnatural. I am a fan of speech
but I need to plug in a framework built by people who have solved speech interaction issues. However, while
I could just wire up another messaging system API, I wanted to lay the starting block for back and forth chat flow with the system and
this layout let me enter large text blocks (like how I speak) and test the search boost configuration against those patterns, leveraging
the power of Elasticsearch itself.

### 3. Does this work on other operating systems?
I originally developed using Elasticsearch 1.x on Windows 7, and later Windows 10. Today, I ported it to MAC OSX in less than 30 mins in terms of the Elasticsearch and Kibana setup and re-indexing. I was using the latest release of Elasticsearch and Kibana as wanted to use it as an opportunity to refresh on Elasticsearch as had not used it since mid 2015. The tools have improved vastly in that time. It should work on other OSes as I'm using only the Elasticsearch Javascript client (latest release) as main backbone here for my own code in the main vexss-client.js file.

### 4. What are the main component files we need to care about if we customize?
vexss-client and and index.html are the two core files. You can adapt them easily - I already customized them on the fly today; just remember to adjust your -kb name in the POST line of the JSON file if you wish to create new -kb references and update the index.html HTML ids and name attributes accordingly. You can obviously customize the JSON data model however you wish for your own needs.

### 5. Have you got an automated CRUD tool for the JSON data model instances?
No. That's something I'll probably create using Spring Boot or PHP, as a simple utility application. My workflow habit is text files in vi on OSX or an editor like notepad++ on Windows for now. It's just faster, so the tool needs to be fast enough not to get in my way. My natural text file would be much simpler than the one I created here, however, so this JSON file template is a good candidate for tooling as much of it is metadata about the file itself deliberately modelled to target machine learning APIs for data sample training purposes.
