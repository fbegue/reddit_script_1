var rp = require('request-promise');
const fs = require('fs');
var token = "52995552-07gMazDevEhpZluTGWodcSGJ8xg";

//recursion explained
//https://www.bennadel.com/blog/3201-exploring-recursive-promises-in-javascript.htm

var options = {
	method: 'GET',
	uri: 'https://oauth.reddit.com/user/dacandyman0/saved?limit=100',
	headers: {
		'Authorization':'Bearer ' + token,
		'User-Agent':"script_1"
	},
	json: true // Automatically stringifies the body to JSON
};

function start(){

	var pages = [];
//t1_g1e1r57
//t3_i1be06
	rp(options)
		.then(function (body) {
			if(body.data.after){
				pages.push(body.data.children)
				if(body.data.after === 't3_i1be06'){
					console.log(pages.length);
					console.log("short");
				}else{
					var op = Object.assign({},options)
					op.uri = op.uri + "&after=" + body.data.after;
					console.log(op.uri);
					return rp(options)
				}

			}else{
				console.log("finished");
			}
		})
		.catch(function (err) {
			console.log(err);
		});
}

Promise.resolve()
	.then(
		function() {

			console.group( "Recursion - external function." );
			return( 3 );

		}
	)
	.then(
		function( n ) {

			// With the recursive function factored out into its own stand-alone
			// function, it's a lot easier to see that we are creating a totally
			// TANGENTIAL BRANCH of the Promise chain.
			// --
			// A
			// |
			// B --> B'3 --> B'2 --> B'1 --> B'0
			// |
			// C
			var tangentialPromiseBranch = recurseToZero( n );

			return( tangentialPromiseBranch );

		}
	)
	.then(
		function(result) {
			console.log(result.length);
			console.log("-------------");
			fs.writeFileSync('items.json', JSON.stringify(result));
			//console.log(JSON.stringify(itemsMap));

			var totals = {};
			for (var prop in itemsMap){
				!(totals[prop]) ? totals[prop] =0 : {};
				totals[prop] = itemsMap[prop].length;
				//todo: sort isn't working...
				itemsMap[prop].sort(function(ll,rl){return ll.created_utc > rl.created_utc } )
			}
			fs.writeFileSync('itemsMap.json', JSON.stringify(itemsMap));
			console.log(JSON.stringify(totals));
			console.groupEnd();

		}
	)
;


function makeOp(after){
	var op = Object.assign({},options)
	op.uri = op.uri + "&after=" + after;
	console.log(op.uri);
	return op;
}

var items = [];
var itemsMap = {};

function recurseToZero( after ) {

	console.log( "Entering recursive function for [", after, "]." );

	// Once we hit zero, bail out of the recursion. The key to recursion is that
	// it stops at some point, and the callstack can be "rolled" back up.
	//if(after === null || after === 't3_hu6hgb'){
	if(after === null){
		console.log("finished",items.length);
		return(items);

	}

	// Start a NEW PROMISE CHAIN that will become the continuation of the parent
	// promise chain. This new promise chain now becomes a completely tangential
	// branch to the parent promise chain.


    var options = makeOp(after)
	var tangentialPromiseBranch = rp(options).then(
		function(body) {
			console.log(body.data.children.length);
			items = items.concat(body.data.children)
			console.log("#items:",items.length);
			items.forEach(i =>{
				!(itemsMap[i.data.subreddit]) ? itemsMap[i.data.subreddit] = [] : {};
				var red = {subreddit:i.data.subreddit,
					title:i.data.title,
					permalink:i.data.permalink,
					//link_title:i.data.link_title,
					//link_permalink:i.data.link_permalink,
					//body:i.data.body,
					created_utc:i.data.created_utc,

				}
				itemsMap[i.data.subreddit].push(red);
			})
			//console.log(body.data.after);
			return( recurseToZero( body.data.after ) ); // RECURSE!

		})

	//var tangentialPromiseBranch = Promise.resolve().then(
	//	function() {
	//
	//		return( recurseToZero( n - 1 ) ); // RECURSE!
	//
	//	}
	//);

	return( tangentialPromiseBranch );

}

// I am the recursive function, factored-out into its own function.
function recurseToZero1( n ) {

	console.log( "Entering recursive function for [", n, "]." );

	// Once we hit zero, bail out of the recursion. The key to recursion is that
	// it stops at some point, and the callstack can be "rolled" back up.
	if ( n === 0 ) {

		return( 0 );

	}

	// Start a NEW PROMISE CHAIN that will become the continuation of the parent
	// promise chain. This new promise chain now becomes a completely tangential
	// branch to the parent promise chain.
	var tangentialPromiseBranch = Promise.resolve().then(
		function() {

			return( recurseToZero( n - 1 ) ); // RECURSE!

		}
	);

	return( tangentialPromiseBranch );

}