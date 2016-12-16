# vexss-spring
Vendor Expert Support System (VExSS) - Elasticsearch Prototype - Spring Domain.

## WHAT
VExSS is a prototype expert system designed to target a single vendor or open source project (OSP) from the Vendelligence system.

I built the original prototype in 2015 when I was playing with Elasticsearch 1.x releases on Windows 10. This is an updated version covering Spring projects instead of the SAP domain. It runs on Elasticsearch 5.x.

It consists of a single HTML view, a Javascript client (no frameworks), and the Elasticsearch.js library to connect to the Elasticsearch server. It runs inside any HTTP server.

Kibana is used for indexing in the interim, as it lets me iterate the JSON data model quickly in tandem with my text editors of choice, without needing me to write a separate CRUD utility during the prototyping phase.

## WHY
I wanted a dedicated expert system to support me during my own vendor support services or prototype experiments with open source projects (OSPs).

While Vendelligence focuses on the data curation and data storage steps, VExSS focuses on querying that stored Query data, using a more complex data structure, to help lay the building blocks for an initial expert system.

The idea is to tune the search results using the flags, labels, and pattern variants in the JSON data model instances.

The next step is testing out the JSON data model instances against machine learning APIs. I will need a reasonably large number of instances to train any such API. I am researching the Google Sentiment Analysis and NLP APIs to determine if an initial prototype can be created using VExSS as the base layer.

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

## TEST RESULTS
The current build is a prototype and main focus is on wiring up Elasticsearch and iterating the JSON data model. The results will show stuff from other knowledge base categories if it does a keyword match right now, even it pushes the most relevant result to the top. I have experimented with various search boost settings in the past, so will re-introduce those tests to this version to fine-tune the results and utilise more fields from the JSON data model that are intended filter out the most accurate answer.

## FAQ
### 1. Why do you have Query Topic Variants defined?
To allow for variations in queries the way I ask them myself or the way a client used to ask me questions. Two people might be asking the same thing but phrase it quite differently. Remember, this is intended to be plugged into machine learning APIs, so we need to give the system something concrete to work with in a prototype.

### 2. Why is the textarea so big - why not just a search panel?
This is deliberately a single-page-application. When I created the initial prototypes in 2015, I also used a voice-plugin for
some browsers, but the speech interaction annoyed me because it was clunky, command-oriented and unnatural. I am a fan of speech interfaces but I need to plug in a framework built by people who have solved speech interaction issues. To use this in a work context, I need background noise filtered out! However, while I could just wire up another messaging system API, I wanted to lay the starting block for back and forth chat flow with the system and this layout let me enter large text blocks (like how I speak) and test the search boost configuration against those patterns, leveraging the power of Elasticsearch itself.

### 3. Does this work on other operating systems?
I originally developed using Elasticsearch 1.x on Windows 7, and later Windows 10. This version (December 2016) was ported to MAC OSX in less than 30 mins in terms of the Elasticsearch and Kibana install and setup. The JSON data files had to be created from scratch using the original data model templates. I was using the latest release of Elasticsearch and Kibana as wanted to use it as an opportunity to refresh on Elasticsearch, as had not used it since mid 2015. It should work on other operating systems as I'm using only the Elasticsearch Javascript client (latest release) as main backbone here for my own code in the vexss-client.js file.

### 4. What are the main component files we need to care about if we customize?
vexss-client and and index.html are the two core files. You can adapt them easily - I already customized them on the fly today; just remember to adjust your -kb name in the POST line of the JSON file if you wish to create new -kb references and update the index.html HTML ids and name attributes accordingly. You can obviously customize the JSON data model however you wish for your own needs.

### 5. Have you got an automated CRUD tool for the JSON data model instances?
No. My focus is prototyping the expert system aspects so Kibana worked perfectly as a CRUD utility for the initial builds. I will need a way to generate a large sample of JSON instances if I am going to get any meaningful results from Google machine learning and NLP API integration tests, so I will look at options for sample JSON data file generation to support that exercise.

### 6. Are you open to collaboration?
Yes. All my projects are experiments in my view, so I'm more than happy to get help from folks who can add insights or create tools that help the project.
