/**
 * @author Niall Guerin
 * Prototype using external JavaScript library to interact with Elastic Search Javascript API.
 * This prototype initially used Windows 10 local install of Elastic Search 1.5.2.
 * The knowledge domain is "Spring" based on my own experience and projects.
 * The initial prototype is a SPA (Single Page Application). 
 * This vexss-client can be dropped into an http server and launched at localhost:xx/vexss-client
 * This version was upgraded to run on Elasticsearch 5.1.1 on OSX (Kibana on same release)
 * 
 * Preconditions: 
 * 
 * Elasticsearch running on LATEST release
 * Elasticsearch Javascript client on LATEST release
 * 
 * Elasticsearch is running on localhost:9200
 * 
 * elasticsearch.yml is updated with following additional configuration properties if running on localhost
 * 
 * # add below properties to avoid access-control-allow-origin errors in browser developer tools console
 * http.cors.enabled: true
 * http.cors.allow-origin: "*"
 * 
 * 15.12.2016
 */
//<![CDATA[
/* In order to use Elastic Search API we need a client instance. */
	
// BEGIN MAIN FUNCTION
// Global Constant Variables to handle the Display. For prototype only - do not use global variables like this in any customer version.
var solutionDisp = "Solution";
var webRefDisp = "Web References";
var singleLineBreak = '<br />';
var doubleLineBreak = '<br /><br />';
var titleOpenTag = '<h4 class="h4">';
var titleCloseTag = '</h4>';
var targetBlank = " target=_blank";
var queryCacheObject;
var outputContainer;
var queryCacheList = [];

function mainController()
{ 
	// Use the DOM to extract the input query value from the customer input form.    
	var queryString = query.value;
	var queryFocus = "";
    
    // For displaying results to the user. Possible security vulnerability using DOM in this way. Do security hardening in future code review.
    var output = document.getElementById("responseArea");

	// Allow for "answer unknown" scenarios and provide feedback-loop to handle this use case
	// This will spawn query chaining type=UnrelatedQueryChain.
	var unknownSubject = "We do not have any information about this topic. Open system message mode to enable live analysis.";

	// Get a connection to the ES cluster.
	var clientObj = getConnection();

   	/* Call targetKb to identify which subject-matter-expert knowledge base we target within the chosen product domain.
   	 * This is to optimize the search using specific subject-matter-expert TYPE versus searching ALL TYPES.
   	 * The TYPES are driven by Vendelligence curation for vendors or open source projects (osps)
   	*/
   	queryFocus = getTargetKb();
   	
   	// Do the search
   	doSearch(queryFocus, queryString, clientObj, output, unknownSubject);  	
}

	// END MAIN FUNCTION

	// BEGIN function library
	function getConnection()
	{
			// Set up JavaScript Client API connection per ES API.
  			var client = elasticsearch.Client(
  			{
    			host: 'localhost:9200',
    			log: 'trace'
    	 	}
    	 	);
    	
    		// Ping the Elastic Search cluster and check it's available before we fire a query. Log the errors.
    		client.ping({
    		requestTimeout: 10000,
    		}, function(error)
    		{
    			if(error)
    			{
    				console.error('Elasticsearch cluster is down. Check if the ES cluster is running or consult your operations team.');
    			}
    			else 
    			{
    				console.log('Elasticsearch cluster is up and running!');
    			}
    		});
   			return client;
	}

	function getTargetKb()
	{
    	/* The value of the queryFocus maps to the user-specified knowledge base using DOM to obtain the value.
     	* We target the index for performance reasons. ES advises searching 1 index AND 5 shards = 5 indexes with 1 shard.
     	* We need to keep in mind the initial/extended shard count but for logical grouping reasons (although I may redesign it)
     	* I do not like having all product solutions bundled into single type.
     	*/
     	var queryTarget = "";
    	var radioNodeList = document.getElementsByName("kbType");
    	for (var i = 0; i < radioNodeList.length; i++)
    	{
    		if ( radioNodeList[i].checked == true )
    		{
    			queryTarget = radioNodeList[i].value;
    		}
    		
    	}
    	return queryTarget;
    }

	function doSearch(esType, query, clientObject, output, unknownSubject)
	{
	// Will do a less optimal Global TYPE search if user does NOT apply targetKb filter. No need for separate function; type will be blank
	// and ES will handle that as already tested it. We can refactor later IF any issue with not using explicit value.
  	
  	// Reset output feedback area so we can handle accidental OR repeat searches. Enable cache functions if using BACK navigation
  	// OPEN in NEW TAB for prototype
  	output.innerHTML = "";
  	
  	clientObject.search(
  		{
  			// Default index for the initial release is PUBLIC.
  			index: 'spring_solution_db',
  			type: esType,
  			body: 
  			{
  				// Use ES property to filter in advance what fields we want to retrieve in JSON to reduce extraneous data feed.
  				"_source": ["fullSolution", "webRefs.title", "webRefs.link"],
  				query: 
  				// Testing Elastic search Queries, Filters and Search Precision options to improve hit accuracy in V1 prototype.
    			{
      				"match":
      				{
      						"queryTopicVariants": query 
      				}

    			},
  			}
		}
		).then(function (resp) 
			{
				// Variable to store the raw ES search result(s).
    			var rawJson = resp.hits.hits;
    			var solve = "";
    			var solutionLink;
    			
    			// Determine how many hits so we can handle the search output and alternative paths accordingly.
				var hitCounter = resp.hits.total;
				
				if ( hitCounter === 1 )
				{
					
					// BEGIN Cache the objects for Reporting.
					insertCacheEntry( query );
					// END Cache the objects for Reporting.
	
    				// IF multiple HITs, dump them into an Array so we can format it later to display.
    				var hits = [];
    				var links = [];
    				var linksList = [];
    				var wrc = 0;
    				var hitsElement;
    				var linkElement;
    			
    				solve = getFormattedResult(rawJson);
    			
    					// Check if 0..N links. IF > 1 Loop through them and push them as objects into the Links array.
    					if ( rawJson[0]._source.webRefs.length > 1 )
    					{
    						var wrlength = rawJson[0]._source.webRefs.length;
    						for (wrc = 0; wrc < wrlength; wrc++ )
    						{
    							solutionLink = getLink( rawJson[0]._source.webRefs[wrc].title, rawJson[0]._source.webRefs[wrc].link );
    							linksList.push (solutionLink);
       						}
       						
       						/* UPDATED: 15.12.2016. 
       						 * 
       						 * Added temporary workaround function to handle multi-link bug which was rendering only first link
       						 * on single output. Add same reference for other multiple output use cases as they'll need it.
       						 * 
       						 */
       						doSingleOutputManyLinks ( output, solve, linksList );
    					}	
    					else
    					{
							solutionLink = getLink(solve._source.webRefs[0].title, solve._source.webRefs[0].link);
							doSingleOutputOneHit ( output, solve, solutionLink );
    					}
    								    					    	
					
					// BEGIN Cache the objects for Reporting.
    				outputContainer = output.innerHTML;
					insertCacheEntry( query );
					// END Cache the objects for Reporting.	
				}
				
				else if ( hitCounter > 1 )
				{
    			
    				// IF multiple HITs, dump them into an Array so we can format it later to display.
    				var hits = [];
    				var links = [];
    				var linksList = [];
    				var wrc = 0;
    				var hitsElement;
    				var linkElement;
    			
    				// ARRAY sizes used to store the required values for end user and determined by HITs value from ES search result JSON.
    				for (c = 0; c < rawJson.length; c++)
    				{
    					// Add the found Solution object to the hits array. PUSH onto the stack.
    					solve = rawJson[c]._source.fullSolution;		
    					hits.push(solve);
    					
    					// Check if 0..N links. IF > 1 Loop through them and push them as objects into the Links array.
    					if ( rawJson[c]._source.webRefs.length > 1 )
    					{
    						var wrlength = rawJson[c]._source.webRefs.length;
    						for (wrc= 0; wrc < wrlength; wrc++ )
    						{
    							solutionLink = getLink( rawJson[c]._source.webRefs[wrc].title, rawJson[c]._source.webRefs[wrc].link );
    							linksList.push (solutionLink);
    						}
							
							// Display to the console doMultipleOutput
							hitsElement = hits[c];
							doMultipleOutputManyHits( output, linksList, hitsElement );
							
							// Reset local variables, so subsequent loop interactions do not use old values.
							wrlength = 0;
							linksList.length = 0;
    					}
    					else
    					{
    						solutionLink = getLink( rawJson[c]._source.webRefs[0].title, rawJson[c]._source.webRefs[0].link );
    						hitsElement = hits[c];
    						doSingleOutputManyHits( output, solutionLink, hitsElement );
    					}	
    								    					    				
    				}
					
					// BEGIN Cache the objects for Reporting.
    				outputContainer = output.innerHTML;
					insertCacheEntry( query );
					// END Cache the objects for Reporting.	
				}
				else
				{
					output.innerHTML = unknownSubject;
				}
				
			}, function (err) 
			{
    			console.trace(err.message);
			}
		);
	}

	/* This was implemented to handle an ES metadata issue in lower 1.x release. Re-evaluate if it can be dropped in newer release. */
	function getFormattedResult(input)
	{
    	// Convert JSON response into string text as we have [] array markers in ES Search Result and it is making it difficult to parse.
    	var result = JSON.stringify(input);
    	var fString = result.substring(1, result.length-1);
    			
    	// Convert the formatted string back into a JavaScript object so we can directly access the object field values.
    	var cResults = JSON.parse(fString);
    	return cResults;
	}	
	
	// Simple function to hyperlink the weblink in the JSON search hit.
	function getLink(title, link)
	{
		var remoteLink = title.link(link);
		return remoteLink;
	}
	
	function doSingleOutputOneHit( output, solve, solutionLink )
	{
		output.innerHTML += titleOpenTag + solutionDisp + titleCloseTag + solve._source.fullSolution + titleOpenTag + webRefDisp + titleCloseTag + solutionLink;
		
		// Cache by default. Radio button choice will disable this caching for Report generation.
		outputContainer = output.innerHTML;
	}
	
	function doSingleOutputManyLinks( output, solve, linksList )
	{
		output.innerHTML += titleOpenTag + solutionDisp + titleCloseTag + solve._source.fullSolution + singleLineBreak;
		var counter;
		for (counter = 0; counter < linksList.length; counter++)
		{ 
			output.innerHTML += titleOpenTag + webRefDisp + titleCloseTag + linksList[counter];
		}
	}
	
	function doSingleOutputManyHits( output, solutionLink, hitsElement )
	{
		output.innerHTML += titleOpenTag + solutionDisp + titleCloseTag + singleLineBreak + hitsElement + singleLineBreak + titleOpenTag + webRefDisp + titleCloseTag + singleLineBreak + solutionLink;
	}
	
	function doMultipleOutputManyHits( output, linksList, hitsElement )
	{
		output.innerHTML += titleOpenTag + solutionDisp + titleCloseTag + singleLineBreak + hitsElement + singleLineBreak;
		var counter;
		for (counter = 0; counter < linksList.length; counter++)
		{ 
			output.innerHTML += titleOpenTag + webRefDisp + titleCloseTag + singleLineBreak + linksList[counter] + doubleLineBreak;
		}
	}
	
	function insertCacheEntry ( query )
	{
		queryCacheObject = new createCacheObject( query, outputContainer );
		queryCacheList.push ( queryCacheObject );
	}
	
	function createCacheObject( query, outputContent )
	{
		// Cached object stores the original question and the full answer be it single, multiple, or single multi-link, multi-multi-link.
		this.question = query;
		this.answer = outputContent;
	}
	
	function queryCacheReportHandler()
	{
		var reportWindow = window.open("report", "_blank", "menubar=yes, scrollbars=yes, titlebar=yes, resizable=yes, top=100, left=100, width=800, height=600");
		var reportBoilerPlate = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><link rel="stylesheet" type="text/css" href="master-styles.css" /></head><title>Informazine VExSS Release 1</title><body><div class="reportHeader">Solutions Report</div>';
		var reportClosingTags = '</body></html>'; 
		
		// Create the main HTML report header boilerplate.
		reportWindow.document.write(reportBoilerPlate);
		
		// Loop through the cache array and print cell content to screen.
		var i;
 		for (i = 0; i < queryCacheList.length; i++)
 		{
 			reportWindow.document.write('<header class="heading">' + titleOpenTag + 'Topic Question:' + titleCloseTag + queryCacheList[i]["question"] + queryCacheList[i]["answer"] + '</header>');
 		}
		
		reportWindow.document.write('<button onclick="printReport()">Print this report</button>');
		reportWindow.document.write('<script>function printReport(){window.print();}</script>');
 		
 		// Write closing tags and close the writer so the window does not stay in endless loop.
 		reportWindow.document.write(reportClosingTags);
		reportWindow.document.close();
	}
	
	function clearReportCache()
	{
		// Reset the original array to 0. Not using .splice() as it would return a copy of original which is not required.
		queryCacheList = [];
	}
	// END FUNCTION LIBRARY
//]]>