var suits = ["D","C","H","S"];
var values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
var cardBackPath = "CardSprites/CardBack.png";
var startButton = document.getElementById('startButton');
var dealerRow = document.getElementById('dealerCardRow');
var playerRow = document.getElementById('playerCardRow');
var secondButton = document.getElementById('secondButton');
var betRow = document.getElementById('betRow');
var moneyLabel = document.getElementById('moneyLabel');

var dealerHand = [];
var playerHand = [];

var bet = 0;
var money = 100;

//Add high score chart and login name and shit

class card {
  constructor(suit, value, isFaceUp = true){
    this.suit = suit;
    this.value = value;
    this.isFaceUp = isFaceUp;
  }
  get spritePath(){
    if (this.isFaceUp){
      return "CardSprites/"+this.value+this.suit+".png";
    }else{
      return cardBackPath;
    }
  }
  get number(){
    var num = values.indexOf(this.value)+1;
    if (num > 10){
      num = 10;
    }
    return num;
  }
  createElement(){
    var cardElement = document.createElement("img");
    cardElement.src = this.spritePath;
    cardElement.className = "card";
    cardElement.id = this.number;
    return cardElement;
  }
  setFaceUp(isFaceUp){
    this.isFaceUp = isFaceUp;
    return this;
  }

}

cards = [];
for (i = 0; i < suits.length; i++){
  for (j = 0; j < values.length; j++){
    cards.push(new card(suits[i],values[j]));
  }
}

var deck = {
  cards: cards,
  shuffle(){
    newDeck = [];
    while (this.cards.length > 0){
      var num = Math.floor(Math.random()*this.cards.length)
      this.cards[num].isFaceUp = true;
      newDeck.push(this.cards[num]);
      this.cards.splice(num, 1);
    }
    this.cards = newDeck;
  },
  draw(){
    return this.cards.pop();
  }
}

var restart = function(){
  while (dealerRow.hasChildNodes()){
    dealerRow.removeChild(dealerRow.firstChild);
  }
  while (playerRow.hasChildNodes()){
    playerRow.removeChild(playerRow.firstChild);
  }
  document.body.removeChild(document.getElementById('resultText'));
  resetButtons("reset");
}

var resetButtons = function(action){
  if (action === "begin"){
    while (betRow.firstChild){
      betRow.removeChild(betRow.firstChild);
    }
    while (moneyLabel.firstChild){
      moneyLabel.removeChild(moneyLabel.firstChild);
    }
    startButton.innerHTML = "Hit";
    secondButton.innerHTML = "Stand";
    secondButton.addEventListener('click',stand);
  }
  else if (action === "over"){
    startButton.innerHTML = "Restart";
    secondButton.innerHTML = "Home";
    secondButton.removeEventListener('click',stand);
  }
  else if (action === "reset"){
    var betForm = document.createElement("form");
    betForm.id = "betForm";
    betRow.appendChild(betForm);
    betForm = document.getElementById('betForm');

    var betLabel = document.createElement("label");
    betLabel.id = "betLabel";
    betLabel.innerHTML = "Bet:";
    betForm.appendChild(betLabel);

    var betInput = document.createElement("input");
    betInput.id = "betInput";
    betInput.type = "number";
    betInput.name = "betInput";
    betInput.onSubmit = "start()";
    betForm.appendChild(betInput);


    // document.getElementById('betForm').addEventListener("keyup", function(event) {
    //     if (event.key === "Enter") {
    //       console.log(document.getElementById('betForm').submit());
    //       startButton.click();
    //     }
    // }); dude how the fuck does this work lmao just don't hit enter

    var mL = document.createElement("h2");
    mL.id = "moneyText";
    mL.class = "Header";
    mL.innerHTML = "You have $" + money;
    moneyLabel.appendChild(mL);

    startButton.innerHTML = "Start";
    secondButton.innerHTML = "Rules";
  }
  else if (action === "home"){

  }
}

function sleep(duration) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, duration * 1000)
	})
}

var bust = function(){
  var bustText = document.createElement('h1');
  bustText.innerHTML = "You busted!";
  bustText.className = "header";
  bustText.id = "resultText";
  document.body.appendChild(bustText);
  money = money - bet;
  resetButtons("over");
}

var win = function(){
  var winText = document.createElement('h1');
  winText.innerHTML = "You win!";
  winText.className = "header";
  winText.id = "resultText";
  document.body.appendChild(winText);
  money = money + bet;
  resetButtons("over");
}

var lose = function(){
  var loseText = document.createElement('h1');
  loseText.innerHTML = "You lose!";
  loseText.className = "header";
  loseText.id = "resultText";
  document.body.appendChild(loseText);
  money = money - bet;
  resetButtons("over");
}

var deal = function(target, faceUp = true){
  var c = (deck.draw());
  switch (target){
    case "player":
      playerRow.appendChild(c.setFaceUp(faceUp).createElement());
      playerHand.push(c);
      if (getTotal(playerRow) > 21){
        bust();
      }
      break;
    case "dealer":
      dealerRow.appendChild(c.setFaceUp(faceUp).createElement());
      dealerHand.push(c);
      if (getTotal(dealerRow) > 21){
        win();
      }
      break;
    }

}

var getTotal = function(row){
  var cards = row.getElementsByClassName("card");
  var cardValues = [];
  for (var i = 0; i < cards.length; i++){
     var num = parseInt(cards[i].id);
     if (num === 1){
       num = 11;
     }
     cardValues[i] = num;
  }
  var total = (cardValues).reduce((partial_sum, a) => partial_sum + a,0);
  while (total > 21 && cardValues.includes(11)){
    cardValues[cardValues.indexOf(11)] = 1;
    total = (cardValues).reduce((partial_sum, a) => partial_sum + a,0);
  }
  return total;
}

var stand = function(){
  dealerRow.removeChild(dealerRow.lastChild);//for some reason the nodelist changes, maybe i can try looping through and removing empty spacE?
  dealerHand[1].isFaceUp = true;
  dealerRow.appendChild(dealerHand[1].createElement());
  dealerTotal = getTotal(dealerRow);
  playerTotal = getTotal(playerRow);
  while (dealerTotal < playerTotal){
    sleep(4);
    (deal('dealer'));
    dealerTotal = getTotal(dealerRow);
  }
  if (dealerTotal <= 21){
    lose();
  }
}

var start = function(){
  console.log("started");
  if (startButton.innerText === 'Start'){
    bet = parseInt(document.getElementById("betInput").value);
    if (bet <= 0 || bet > money){
      document.getElementById('moneyText').innerHTML = "Invalid Bet";
    }else{
      resetButtons("begin");
      deal("dealer",true);
      deal("dealer",false);
      deal("player", true);
      deal("player", true);
      console.log(getTotal(playerRow));
      resetButtons('begin');
    }
  } else if (startButton.innerText === "Hit"){
    deal('player');
    console.log(getTotal(playerRow));
  } else if (startButton.innerText === "Restart"){
    restart();
  }
}

resetButtons('reset');

deck.shuffle();

startButton.addEventListener('click',start);
