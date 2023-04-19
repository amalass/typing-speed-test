/* Start defining DOM variables */
let p = document.querySelector(`.container .game .paragraph`);
let input = document.querySelector(`.container input`);
let failure = document.querySelector(`.failure`);
let success = document.querySelector(`.success`);
let done = document.querySelector(`.done`);
let oops = document.querySelector(`.oops`);
let timer = document.querySelector(`.head .timer`);
let line = document.querySelector(`.head .line`);
let result = document.querySelector(`.result`);
let wpmContainer = document.querySelector(
  `.result .content .wpm span:first-of-type`
);
let accuracyContainer = document.querySelector(
  `.result .content .accuracy span:first-of-type`
);
let typosContainer = document.querySelector(
  `.result .content .accuracy span:last-of-type`
);
let speedContainer = document.querySelector(
  `.result .content .speed span:first-of-type`
);
/* End defining DOM variables */
// focusing on the input
input.focus();
input.onblur = () => {
  input.focus();
};

/* getting data from data.json */
async function getData() {
  let data = await (await fetch(`./data.json`)).json();
  return data[(Math.random() * (data.length - 1)).toFixed()];
}
/* Start Insertion sentence */
function insertSentence(data) {
  data.split(` `).forEach((element) => {
    let word = document.createElement(`div`);
    word.classList.add(`word`);
    [...element].forEach((e) => {
      let span = document.createElement(`span`);
      span.textContent = e;
      word.appendChild(span);
    });
    let space = document.createElement(`span`);
    space.textContent = ` `;
    space.style.padding = `5px 3px`;
    word.appendChild(space);
    p.appendChild(word);
  });
}
/* End Insertion sentence */

let work = true;
function showRes() {
  if (work) {
    result.lastElementChild.addEventListener(`click`, () => {
      clearTimeout(time);
      work = false;
      setTimeout(() => {
        work = true;
      }, 1000);
    });
    let time = setTimeout(() => {
      result.lastElementChild.addEventListener(`click`, () => {
        clearInterval(time1);
        clearInterval(time2);
        clearInterval(time3);
        clearInterval(time4);
      });
      let time1 = setInterval(() => {
        if (+wpmContainer.textContent === wpm) clearInterval(time1);
        wpmContainer.textContent = +wpmContainer.textContent + 1;
      }, 30);
      let time2 = setInterval(() => {
        if (+parseInt(accuracyContainer.textContent) === accurcy)
          clearInterval(time2);
        accuracyContainer.textContent = `${
          parseInt(accuracyContainer.textContent) + 1
        }%`;
      }, 20);
      let time3 = setInterval(() => {
        if (+speedContainer.textContent === +(wpm * (accurcy / 100)).toFixed())
          clearInterval(time3);
        speedContainer.textContent = +speedContainer.textContent + 1;
      }, 30);
      let time4 = setInterval(() => {
        if (parseInt(typosContainer.textContent) === typos)
          clearInterval(time4);
        typosContainer.textContent = `${
          parseInt(typosContainer.textContent) + 1
        } typos`;
      }, 50);
    }, 1000);
    result.style.cssText = `visibility: visible;transform: translate(-50%, -50%) scale(1);`;
    if (accurcy >= 80 && wpm >= 30) {
      done.play();
      result.classList.add(`good`);
    } else {
      oops.play();
      result.classList.add(`bad`);
    }
    input.setAttribute(`disabled`, `true`);
  } else {
    work = true;
  }
}

/* start the timer function */
function startTimer(data) {
  line.style.width = `100%`;
  setTimeout(() => {
    timer.textContent = `0:59`;
    let time = setInterval(() => {
      let timeValue = timer.textContent.split(`:`)[1];
      if (input.value.length === data.length || typos >= 50) {
        clearInterval(time);
        line.style.transition = `width 0`;
        line.style.width = `${100 - (timeValue / 60) * 100}%`;
        return;
      }
      if (+timeValue === 0) {
        calcRes();
        showRes();
        clearInterval(time);
        return;
      }
      if (timeValue > 10) timer.textContent = `0:${timeValue - 1}`;
      else timer.textContent = `0:0${timeValue - 1}`;
    }, 1000);
  }, 1000);
}
/* End the timer function */
/* Start calculating words per minute */
let wpm, accurcy;
let typos = 0;
function calcRes() {
  let typedLetters = 0;
  let divs = [...p.children];
  mainFor: for (let i = 0; i < divs.length; i++) {
    for (let j = 0; j < [...divs[i].children].length; j++) {
      if (
        [...divs[i].children][j].classList.contains(`true`) ||
        [...divs[i].children][j].classList.contains(`false`)
      ) {
        typedLetters++;
      } else {
        break mainFor;
      }
    }
  }
  wpm = +(typedLetters / 5).toFixed();
  accurcy = +(((typedLetters - typos) / typedLetters) * 100).toFixed();
}
/* End calculating words per minute */

/* Start 'typing letters' algorithim */
function typingAlgorithim(data) {
  line.style.transition = `width 60s linear`;
  let firstLetter = true;
  let children = [...p.children]; // array of divs that carries the words
  [...children[0].children][0].classList.add(`next`);
  [...children[0].children][0].classList.add(`first`);
  let wordCount = 0; // a word counter that tell us at which word we are
  let letterCount = 0; // a letter counter that tell us at which letter we are
  let cnt = 1; // it counts the entered letters(we will use it to know if the user has deleted a letter)
  let manually = false; // we will use it to prevent the reset function from resetting letterCount and wordCount
  input.oninput = () => {
    let currentWord = [...children[wordCount].children];
    if (input.value.length === data.length || typos >= 50) {
      calcRes();
      showRes();
    }
    if (firstLetter) {
      currentWord[0].classList.remove(`first`);
      startTimer(data);
      firstLetter = false;
    }
    if (input.value.length !== 0) {
      // checking if the user is writing letters and not deleting
      if (cnt === input.value.length) {
        // checking if the user has entered the right letter
        if (
          input.value[input.value.length - 1] === data[input.value.length - 1]
        ) {
          success.play();
          currentWord[letterCount++].classList.add(`true`);
          cnt++;
        } else {
          failure.play();
          currentWord[letterCount++].classList.add(`false`);
          typos++;
          cnt++;
        }
        // removig 'next' class from previous and next letters
        if (letterCount < currentWord.length - 1)
          currentWord[letterCount + 1].classList.remove(`next`);
        currentWord[letterCount - 1].classList.remove(`next`);
        // adding 'next' class to the next letter
        if (letterCount < currentWord.length) {
          currentWord[letterCount].classList.add(`next`);
        }
        // it will work when the user delete a letter
      } else {
        backward(); // it's a fucntion that takes the user to the previous word if he has reached the first letter in the current one
        letterCount--;
        cnt--;
        currentWord = [...children[wordCount].children];
        currentWord[letterCount].classList.remove(`true`);
        currentWord[letterCount].classList.remove(`false`);
        if (letterCount + 1 < currentWord.length)
          currentWord[letterCount + 1].classList.remove(`next`);
        currentWord[letterCount].classList.add(`next`);
      }
      // it will work if `input.value === 0`
    } else {
      cnt = 1;
      letterCount = 0;
      wordCount = 0;
      [...children[0].children][0].classList.remove(`true`);
      [...children[0].children][0].classList.remove(`false`);
      [...children[0].children][0].classList.add(`next`);
      [...children[0].children][1].classList.remove(`next`);
    }
    reset(); // it's a function that takes the user to the next word if he has ended writing the current one
    manually = false;
  };
  function reset() {
    /* 
      the manually variable is used to prevent this function form working when the user
      go back and deletes a letter, it's value will change to true in the backward() function
      (which mean if the user went backward)
    */
    // checking if the user has reached the last letter in the current word
    if ([...children[wordCount].children].length === letterCount && !manually) {
      wordCount++;
      letterCount = 0;
      [...children[wordCount].children][0].classList.add(`next`);
    }
  }
  function backward() {
    if (letterCount === 0) {
      [...children[wordCount].children][0].classList.remove(`next`);
      wordCount--;
      letterCount = [...children[wordCount].children].length;
      [...children[wordCount].children][letterCount - 1].classList.add(`next`);
      [...children[wordCount].children][letterCount - 1].classList.remove(
        `true`
      );
      [...children[wordCount].children][letterCount - 1].classList.remove(
        `false`
      );
      manually = true;
    }
  }
  /* End typing algorithim */
}

/* Start resetting everything */
function resetEverything() {
  let divs = [...p.children];
  divs.forEach((element) => {
    element.remove();
  });
  input.value = ``;
  input.removeAttribute(`disabled`);
  input.focus();
  line.style.transition = `0s`;
  line.style.width = `0%`;
  timer.textContent = `1:00`;
  result.style.cssText = `visibility: hidden;transform: translate(-50%, -50%) scale(0)`;
  result.classList.remove(`good`);
  result.classList.remove(`bad`);
  wpmContainer.textContent = `0`;
  accuracyContainer.textContent = `0%`;
  speedContainer.textContent = `0`;
  typosContainer.textContent = `0 typos`;
  accurcy = 0;
  wpm = 0;
  typos = 0;
}
/* End resetting everything */

getData().then((data) => {
  insertSentence(data);
  typingAlgorithim(data);
});

result.lastElementChild.onclick = () => {
  resetEverything();
  getData().then((data) => {
    insertSentence(data);
    typingAlgorithim(data);
  });
};
