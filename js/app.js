var access_token = "";
var favs = [];

if (localStorage.getItem("favourites")) {
  favs = JSON.parse(localStorage.getItem("favourites"));
}

window.onload = function() {
  var client_id = "1208683175905395";
  var client_secret = "cfea84282b9a98b7ce50f309f7143c1a";
  var http_request = new XMLHttpRequest();

  var url = "https://graph.facebook.com/oauth/access_token?client_id="+ client_id + "&client_secret=" + client_secret + "&grant_type=client_credentials";
  http_request.open("GET", url, true);
 
  http_request.onreadystatechange = function () {
      var done = 4, ok = 200;
      if (http_request.readyState == done && http_request.status == ok) {
          access_token  = http_request.responseText;
      }
  };
   http_request.send(null);
}

var getData = function(){
  document.getElementsByClassName("page-results")[0].style.display = "block";
  document.getElementsByClassName("fav-container")[0].style.display = "none";
  var my_JSON_object = {};
  var http_request = new XMLHttpRequest();
  var str, queryInput = document.getElementById("searchPages");
  var searchFormRow = document.getElementsByClassName('form-search-row')[0];
  var image=document.createElement('img');
  
  if(!queryInput.value){
      return;
  }

  str = encodeURIComponent(queryInput.value);
  image.setAttribute('src', 'img/ajax-loader.gif');
  image.setAttribute('width', '16px');
  image.setAttribute('paddingLeft', '20px');

  searchFormRow.appendChild(image);
  
  var url = "https://graph.facebook.com/search?type=page&q="+ str + "&" + access_token;
  http_request.open("GET", url, true);
  http_request.onreadystatechange = function () {
      var done = 4, ok = 200;
      if (http_request.readyState == done && http_request.status == ok) {
          my_JSON_object = JSON.parse(http_request.responseText);
          displayResults(my_JSON_object, access_token);
          image.parentNode.removeChild(image);
      }
  };
  http_request.send(null);
};


var displayResults = function(pages, token){
   var resultDiv = document.getElementsByClassName('page-results')[0];
   if(pages.data.length){
      resultDiv.innerHTML = "";
   }
   else{
      resultDiv.innerHTML = "No results found";
   }
   for(var i=0; i<pages.data.length; i++)
   {
      var data = pages.data[i];
      var name = pages.data[i].name, category = pages.data[i].category, id= pages.data[i].id;
      if (!category) {
        category = "None";
      }
      var page = document.createElement("div");
      var pname = document.createElement("p");
      var findmore = document.createElement("a");
      var pcategory = document.createElement("p");
      var fav_btn = document.createElement("button");
      var unfav_btn = document.createElement("button");
      fav_btn.id = "fav"+data.id;
      unfav_btn.id = "unfav"+data.id;

      pname.innerHTML = name;
      findmore.innerHTML = " find out more";
      findmore.href= "detail.html?id="+id+"&"+token;
      findmore.target = "_blank";
      pname.appendChild(findmore);
      pcategory.innerHTML = "Category: " + category;
      pcategory.setAttribute('class',"small-font");

      fav_btn.innerHTML = "Favourite";
      fav_btn.style.backgroundColor = "#0099cc";
      fav_btn.style.color = "#fff";
      fav_btn.style.marginRight = "20px";

      unfav_btn.innerHTML = "Unfavourite";
      unfav_btn.style.backgroundColor = "#0099cc";
      unfav_btn.style.color = "#fff";
      unfav_btn.style.marginRight = "20px";

      fav_btn.addEventListener('click', addToFav.bind(this, data));
      unfav_btn.addEventListener('click', addToUnfav.bind(this, data));
      page.setAttribute('class','span2 pageDiv');
      page.appendChild(pname);
      page.appendChild(pcategory);
      page.appendChild(fav_btn);
      page.appendChild(unfav_btn);
      resultDiv.appendChild(page);
     }
    };

   var addToFav = function(data){
      var fav_btn = document.getElementById('fav'+data.id);
      var unfav_btn = document.getElementById('unfav'+data.id);

      //Disable Favourite button
      fav_btn.disabled = true; 
      fav_btn.style.backgroundColor = "#ccc";
      fav_btn.style.color = "#666";
     
     //Enable Unfavourite button
      unfav_btn.disabled = false;
      unfav_btn.style.backgroundColor = "#0099cc";
      unfav_btn.style.color = "#fff";
      
      // Check if the favourites page already contains the page
      for (var i=0; i<favs.length; i++) {
        var obj = favs[i];
        if(data.id==obj.id) {
           return false;     
        }
      } 
      
      //If item not already in favourites page add it to fav array and reset localstorage
      favs.push(data);
      localStorage.setItem("favourites", JSON.stringify(favs));
   };
   
   var addToUnfav = function(data){
      var fav_btn = document.getElementById('fav'+data.id);
      var unfav_btn = document.getElementById('unfav'+data.id);

      //Enable favourite button
      fav_btn.disabled = false;
      fav_btn.style.backgroundColor = "#0099cc";
      fav_btn.style.color = "#fff";
      
      //Disable unfavourite button 
      unfav_btn.disabled = true; 
      unfav_btn.style.backgroundColor = "#ccc";
      unfav_btn.style.color = "#666";
      
      //Check if the favs array contains the data
      for (var i=0; i<favs.length; i++) {
        var obj = favs[i];
        if(data.id==obj.id) {
          favs.splice(i, 1);     
        }
      }
      //Reset localStorage
      localStorage.setItem("favourites", JSON.stringify(favs));
   };

   var getAllFav = function(){
      document.getElementsByClassName("page-results")[0].style.display = "none";
      document.getElementsByClassName("fav-container")[0].style.display = "block";
      //Clear favourites Page
      cleanUpFavouritesPage();
      //Load favourites Page
      getFavouritesLoaded();
   };
  
  var cleanUpFavouritesPage = function() {
    var foo = document.getElementById('details-fav');
    while (foo.firstChild) {
      foo.removeChild(foo.firstChild);
    }
  };

   var getFavouritesLoaded = function(){
       var resultDiv = document.getElementById('details-fav');
       if (resultDiv) {
          var favourites = JSON.parse(localStorage.getItem("favourites"));
          for(key in favourites) {
              var li = document.createElement("li");
              li.setAttribute('class',"removeDecor");
              li.innerHTML = favourites[key].name;
              li.style.paddingBottom = "20px";
              resultDiv.appendChild(li);
            }

       }
   };

   var getPageDeatil = function(){
     var query = window.location.search.substring(1);
     var res = query.split("=");
     var pageid = res[1].toString().split("&")[0];
     var token = res[2];
     getDetailsAjax(pageid, token);
 };

 var getDetailsAjax = function(pageId, token){
   var my_JSON_object = {};
   var http_request = new XMLHttpRequest();
   var str = encodeURIComponent(pageId);

   var url = "https://graph.facebook.com/"+ str+ "?access_token=" + token;
   http_request.open("GET", url, true);
   http_request.onreadystatechange = function () {
      var done = 4, ok = 200;
      if (http_request.readyState == done && http_request.status == ok) {
          my_JSON_object = JSON.parse(http_request.responseText);
          displayDetailsResult(my_JSON_object);
      }
   };
   http_request.send(null);
};

var displayDetailsResult = function(detail){
  var resultDiv = document.getElementById('details');
  var displayImage;
  for (key in detail) {
    if (detail.hasOwnProperty(key)) {
        if(key=="cover"){
            displayImage =true;
        }
        else{
            var li = document.createElement("li");
            li.setAttribute('class',"removeDecor");
            li.innerHTML = key+ " : " + detail[key];
            resultDiv.appendChild(li);
        }
    }
   }
   if(displayImage){
    var heading = document.getElementById('header');
    var image =  document.createElement('img');
    image.setAttribute('src', detail.cover.source);
    heading.insertBefore(image);
   }
  };