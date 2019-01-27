var searchLink = "https://www.ebay-kleinanzeigen.de/s-zu-verschenken-tauschen/stuttgart/c272l9280r20";
var telegram_token = "727307587:A_______________IMgz-od7M";
var telegram_chatId = "-38_____51";


var shortUrl = require('node-url-shortener');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var telegram = require('telegram-bot-api');
var requested = [];

try {
  requested = JSON.parse(fs.readFileSync("requested.json"))
  console.log("Requested loaded");
} catch (exception) {
  console.log("Requested list not found - making new one!");
}

loadListings()

setInterval(function(){
	loadListings()
}, 90000)

function loadListings(){
    var options = {
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36"
      }
    }
    request.get(searchLink, options, function(error, response, body) {
    	const $ = cheerio.load(body);
        var list = [];
        $('article[class="aditem"]').find('div > div').each(function (index, element) {
          try{
          var location = ($(element).attr("data-imgtitle")).split(" - ")[1].replace(" Vorschau", "")
          var title = ($(element).attr("data-imgtitle")).split(" - ")[0]
          var cutOff = title.split(" ")[title.split(" ").length - 1]
          	  title = title.replace(" " + cutOff, "")

          var listing = {
          	title: title,
          	loc: location,
          	img: $(element).attr("data-imgsrc"),
          	link: "https://www.ebay-kleinanzeigen.de" + $(element).attr("data-href")
          }
          if(listing.title && requested.indexOf(listing.link) == -1){
          	requested.push(listing.link)
            var dist = ($(this).parent().next().next().text()).split(" ")
                listing.distance = dist[dist.length - 2] + " km"
            if(listing.img){
          	   //listing.img = listing.img.replace("$_9.JPG", "$_57.JPG")
               listing.img = listing.img.replace("$_9.JPG", "$_8.JPG")
            } else {
               listing.img = "http://www.eastmedyachtshow.com/assets/images/noimg.png"
            }
          	listing.title = listing.title.replace(" Vorschau", "")
            list.push(listing)

            console.log("Title   : " + listing.title)
            console.log("Location: " + listing.loc + " (" + listing.distance + ")")
            console.log("Image   : " + listing.img)
            console.log("Link    : " + listing.link)
            console.log("Posted  : " + timeStamp())
            console.log("")

            send(listing.img, listing.title + "\n > " + listing.loc + " (" + listing.distance + ")", listing.link)
          }
          } catch(exception){
            console.log(exception)
          }
        });
        console.log(" > Requested!")
        saveToFile("requested", requested)
    })	


}

function saveToFile(name, content) {
  fs.truncate(name + ".json", 0, function() {
    fs.writeFile(name + ".json", JSON.stringify(content), function(err) {
      if (err) {
        log("Error saving " + name + ": " + err);
      }
    });
  });
}


function timeStamp() {
  var now = new Date();
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return time.join(":") + " " + suffix;
}

var api = new telegram({
        token: telegram_token,
        updates: {
          enabled: false
    }
}); 

function send(img, text, link){
    shortUrl.short(link, function(err, url){
      api.sendPhoto({parse_mode: "HTML", chat_id: telegram_chatId, photo: img, caption: text + "\n\n" + url});
    });    
}
