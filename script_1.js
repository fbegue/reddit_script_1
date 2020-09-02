var rp = require('request-promise');
const fs = require('fs');
var _ = require('lodash');
const express = require('express')
const app = express()
const port = 3000

app.listen(port, () => {
	var asdf = _.uniqBy([],'created_utc')
	console.log(`Example app listening at http://localhost:${port}`)
})


var comments = [];

app.get('/', (req, res) => {

	Promise.resolve()
		.then(
			function() {
				console.group( "Recursion - external function." );
				return( 3 );
			}
		)
		.then(
			function( n ) {
				var tangentialPromiseBranch = recurseToZero( n,res);
				return( tangentialPromiseBranch );

			}
		)
		.then(
			function(results) {

				//
				// results = _.uniqBy(results,'created_utc')
				// console.log(items2.length);
				// res.send(items2)
				var red = {};
				results.forEach(i =>{
					if(i.type === 'comments'){
						console.log(i);
					}
					!(itemsMap[i.subreddit]) ? itemsMap[i.subreddit] = [] : {};
					red = {};
					red = {
						subreddit:i.subreddit,
						title:i.title,
						permalink:i.permalink,
						type:i.type,
						//link_title:i.link_title,
						//link_permalink:i.link_permalink,
						//body:i.body,
						created_utc:i.created_utc,
					}
					itemsMap[i.subreddit].push(red);

					//testing:
					i.kind === 't1' ? comments.push({author:i.author,subreddit:i.subreddit,body:i.body}):{};
				})


				fs.writeFileSync('items.json', JSON.stringify(results));
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

				res.send(comments)
				//res.send(itemsMap)

				//console.groupEnd();

			}
		)
})

var token = "52995552-HTftCKFxCqOQJbSgFD-6nwc2G-Q";

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



function makeOp(after){
	var op = Object.assign({},options)
	op.uri = op.uri + "&after=" + after;
	console.log(op.uri);
	return op;
}

var items = [];
var itemsMap = {};

function recurseToZero( after,res) {


	console.log( "Entering recursive function for [", after, "]." );

	// Once we hit zero, bail out of the recursion. The key to recursion is that
	// it stops at some point, and the callstack can be "rolled" back up.

	if(after === null || items.length === 2000){
	//if(after === null){
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

			//testing:
			//res.send(body.data);

			body.data.children.forEach(i =>{
				i.data.kind = i.kind;
				items.push(i.data);
			})
			//console.log(JSON.stringify(items[0]));
			//console.log(items[0].subreddit);
			console.log("#items:",items.length);

			//console.log(body.data.after);
			return( recurseToZero( body.data.after ) ); // RECURSE!

		})
	return( tangentialPromiseBranch );

}

//depreciated
function no_promise_recusion(){

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
