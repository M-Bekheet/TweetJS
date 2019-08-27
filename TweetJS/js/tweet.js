
let addTweet = document.querySelector(".add-tweet"),
  title = addTweet.querySelector("#title");
  author = addTweet.querySelector("#author"),
  content = addTweet.querySelector("#content");

class Tweet {
  constructor(title, author, content, today) {
    this.title = title.value;
    this.author = author.value;
    this.content = content.value.replace(/(?:\r\n|\r|\n)/g, '<br>'); //regex to replace new lines by <br> tags
    this.today = today;
  }
}

// has all the methods for adding/manipulating tweets for the UI
class UI {

  addTweet(tweet) {
    const list = document.querySelector(".tweet-list .container");
    const tweetWrapper = document.createElement('div');

    tweetWrapper.innerHTML = `
      <div class="tweet">
        <div><h2 class="tweet-title">${tweet.title}</h2></div>
        <div class="tweet-content">
          <p>
              ${tweet.content}
            </p>
        </div>
        <div class="tweet-data">
        <p><span>Author: </span><span class="author-name">${tweet.author}</span></p>
        <p><span>Date: </span><span class="tweet-date">${tweet.today}</span></p>
        </div>
      </div>
    `;
    
    tweet.content.length > 100 ? this.readMore(list, tweetWrapper) : list.insertBefore(tweetWrapper, list.childNodes[0]);

    this.clearFields();
  }

  readMore(list, tweetWrapper){
    const tweetContent = tweetWrapper.querySelector('.tweet-content').innerHTML;
  
    tweetWrapper.querySelector('.tweet-content').innerHTML = tweetContent.slice(0, 100)
    .concat(`<span class="excerpt-dots">...</span><span class="hidden-content hidden">`) 
    + tweetContent.slice(100, tweetContent.length).concat('<span/>');

    const div = document.createElement('div');
    div.classList.add('read-more');
    div.innerHTML = `<a href = "#">Read More</a>`;
    div.addEventListener('click', toggleReadBtn);
    tweetWrapper.querySelector(".tweet").appendChild(div);

    list.insertBefore(tweetWrapper, list.childNodes[0]);
    
    function toggleReadBtn(e){
      e.preventDefault();
      e.target.textContent = e.target.textContent === 'Read More' ? 'Read Less' : 'Read More';
      e.target.parentElement.parentElement.querySelector(".excerpt-dots").classList.toggle('hidden');
      e.target.parentElement.parentElement.querySelector(".hidden-content").classList.toggle('hidden');
    }

  }
  
  clearFields() { //clearing tweet fields after adding the tweet
    addTweet.querySelector("#title").value = '';
    addTweet.querySelector("#author").value = '';
    addTweet.querySelector("#content").value = '';
  }

  deleteTweet(target) { //not used till now
    if (target.classList.contains('delete')) {
      target.parentElement.parentElement.remove();
    }
  }

  showAlert(message, color) { //show messages if it's failed/succeeded to add a tweet
    const addTweet = document.querySelector('.add-tweet');
    let alert = addTweet.querySelector(".alert");

    alert.classList.add("hide"); //to hide any previous alerts

    alert.innerHTML = `<p style="color: ${color}">${message}</p>`;
    alert.classList.remove('hide'); //adding the alert

    setTimeout(() => {
      alert.classList.add("hide"); 
    }, 3000);
  }

  showStats() {
    const tweetsNum = JSON.parse(localStorage.getItem('tweets')) !== null ? JSON.parse(localStorage.getItem('tweets')).length : 0;
    const lassAdded = tweetsNum ? JSON.parse(localStorage.getItem('tweets'))[0]['today'] : 'No Tweets added yet';

    //removing old stats and adding the new ones
    document.querySelector('.stats-wrapper').innerHTML = `
                      <div class="tweets-stats">
                        <p class="tweets-numbers">Tweets: <span>${tweetsNum}</span></p>
                        <p class="tweets-last-date">Last Added: ${lassAdded}</p>
                      </div>
                    `;
  }
 
}

const ui = new UI();

//Local Storage Data: has all the methods for adding/manipulating tweets for/from the Local Storage store
class Store {

  static getTweets() { //getting them from the local storage store
    let tweets;
    if (localStorage.getItem('tweets') === null) {
      tweets = [];
    } else {
      tweets = JSON.parse(localStorage.getItem('tweets'));
    }
    return tweets;
  }

  static displaytweets() { //displays them after loading the web page
    const tweets = Store.getTweets(); //getting the old tweets from the local storage
    if (tweets.length > 0) {
      tweets.reverse().forEach(tweet => {
        ui.addTweet(tweet);
      });
    }
    ui.showStats();
  }

  static addTweet(tweet) { //adding the new tweet to local storage store
    const tweets = Store.getTweets();
    tweets.unshift(tweet);
    localStorage.setItem('tweets', JSON.stringify(tweets));
  }

}

//posting the tweet
document.querySelector(".tweet-btn").addEventListener("click", function () {

  const date = new Date();
  const today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  const tweet = new Tweet(title, author, content, today);

  if (title.value == '' || author.value == '' || content.value == '' || today == '') {
    ui.showAlert('Please, fill in all fields!', 'red');
  } else if (content.value.length <= 20) {
    ui.showAlert('Your tweet is too short', 'red');
  } else {
    ui.addTweet(tweet) //adding the tweet to the ui
    Store.addTweet(tweet); // adding the tweet to the tweet to the local storage store
    ui.showAlert('Added successfully!', '#0079d3');
    ui.showStats();
  }
})


//toggling between joke & normal tweet
function toggleTweetType() {

  addTweet.classList.add('loading', 'post-joke');

  //change buttons when user prefer change between normal or joke tweets
  document.querySelectorAll('#add-tweet-wrapper .buttons-wrapper button').forEach(button => {
    (!button.classList.contains('tweet-btn')) && button.classList.toggle('hidden');
  });
  setTimeout(() => addTweet.classList.remove('loading'), 1000)
}

//getting a random joke
async function bringJoke() {

  document.querySelector('.bring-joke').innerHTML = '<img class="bring-joke-img rotate" src="images/static-loader.svg" alt="Loader">';

  let joke = await fetch('https://api.chucknorris.io/jokes/random')
    .then(response => response.json())
    .then(myJoke => (
      (myJoke.value) //the joke
        .concat('\n')
    ))
    .catch(error => {
      ui.showAlert('Failed to bring a joke. Kindly check your network connection', 'red')
    });

  document.querySelector('.bring-joke').innerHTML = 'ِBring Joke';

  //adding the joke to the content(if there's a content already, the joke will be added to a new line)
  content.value = joke === undefined ? content.value : (content.value ? content.value.concat('\n').concat(joke) : joke);
}

// getting a random name
async function bringName() {
  document.querySelector('.bring-name').classList.add('rotate');

  let randName = await fetch('https://randomuser.me/api/')
    .then(response => response.json())
    .then(response => response['results'][0])
    .then(result => result['name']['first'].charAt(0).toUpperCase()
      + result['name']['first'].slice(1)
      + " " + result['name']['last'].charAt(0).toUpperCase()
      + result['name']['last'].slice(1))
    .catch(() => {
      ui.showAlert('Failed to bring a name. Kindly check your network connection', 'red')
    });;

  document.querySelector('.bring-name').classList.remove('rotate');

  author.value = randName !== undefined ? randName : author.value;

}

/* 
  >installing the app in the page(showing local tweets & listening to form buttons when clicked)
*/
document.addEventListener('DOMContentLoaded', () => {
  Store.displaytweets();

  // Buttons Event Listeners
  document.querySelector('.wanna-joke').addEventListener('click', toggleTweetType);
  document.querySelector('.wanna-normal-tweet').addEventListener('click', toggleTweetType);
  document.querySelector('.bring-joke').addEventListener('click', bringJoke);
  document.querySelector('.bring-name').addEventListener('click', bringName);
});
