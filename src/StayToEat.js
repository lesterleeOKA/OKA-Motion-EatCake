import View from './view';
import State from './state';
import Sound from './sound';
import QuestionManager from './question';
import { logController } from './logController';

export default {
  createdOptionId: 0,
  questionType: null,
  randomQuestion: null,
  question: '',
  totalQuestions: 0,
  score: 0,
  time: 0,
  remainingTime: 0,
  fallingSpeed: 0,
  timer: null,
  timerRunning: false,
  nextQuestion: true,
  randomPair: [],
  objectItems: [],
  typedItems: [],
  randomQuestionId: 0,
  answeredNum: 0,
  correctedAnswerNumber: 0,
  answerLength: 0,
  questionWrapper: null,
  answerWrapper: null,
  answerTextField: null,
  fillwordTime: 0,
  redBoxX: 0,
  redBoxY: 0,
  redBoxWidth: 0,
  redBoxHeight: 0,
  leftCount: 0,
  rightCount: 0,
  fallingDelay: 0,
  eachQAMark: 0,
  isPlayLastTen: false,
  isTriggeredBackSpace: false,
  columnWidth: 0,
  numberOfColumns: 4,
  wholeScreenColumnSeperated: false,
  starNum: 0,
  apiManager: null,
  itemDelay: 0,
  lang: null,
  engFontSize: null,
  boxStatus: null,
  maxBoxes: 4,
  randomBoxesArea: false,
  boxesArea: null,

  init(lang = null, gameTime = null, fallSpeed = null, engFontSize = null) {
    //View.showTips('tipsReady');
    this.lang = lang;
    this.startedGame = false;
    this.createdOptionId = 0;
    this.remainingTime = gameTime !== null ? gameTime : 120;
    this.fallingSpeed = fallSpeed !== null ? fallSpeed : 6;
    this.engFontSize = engFontSize !== null ? engFontSize : 30;
    this.itemDelay = 250;
    this.fallingDelay = 800;
    this.updateTimerDisplay(this.remainingTime);
    this.questionType = QuestionManager.questionField;
    this.randomQuestion = null;
    this.question = '';
    this.totalQuestions = this.questionType.questions ? this.questionType.questions.length : 0;
    this.score = 0;
    this.time = 0;
    this.timerRunning = false;
    this.nextQuestion = true;
    this.addScore(0);
    this.randomPair = [];
    this.objectItems = [];
    this.typedItems = [];
    this.stopCountTime();
    this.fillwordTime = 0;
    this.questionWrapper = null;
    this.answerWrapper = null;
    this.answerTextField = null;
    View.scoreBoard.className = "scoreBoard";
    this.randomQuestionId = 0;
    this.answeredNum = 0;
    this.correctedAnswerNumber = 0;
    this.answerLength = 0;
    this.redBoxX = View.canvas.width / 3;
    this.redBoxY = (View.canvas.height / 5) * 3;
    this.redBoxWidth = View.canvas.width / 3;
    this.redBoxHeight = (View.canvas.height / 5) * 2;
    this.leftCount = 0;
    this.rightCount = 0;
    View.stageImg.innerHTML = '';
    View.optionArea.innerHTML = '';
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.eachQAMark = 10;
    View.hideSuccess();
    View.hideFailure();
    for (let i = 1; i < 4; i++) {
      let star = document.getElementById("star" + i);
      if (star) {
        star.classList.remove("show");
      }
    }
    this.isPlayLastTen = false;
    this.isTriggeredBackSpace = false;
    this.starNum = 0;
    this.apiManager = State.apiManager;
    this.resetProgressBar();
    this.boxStatus = new Array(this.maxBoxes).fill(false);
    this.boxesArea = [];
  },

  handleVisibilityChange() {
    if (State.state === 'playing') {
      if (document.hidden) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    }
  },

  pauseGame() {
    if (this.timerRunning && this.startedGame) {
      clearTimeout(this.timer);
      this.timerRunning = false;
      this.showQuestions(false);
      this.isPlayLastTen = false;
      if (State.isSoundOn)
        Sound.stopAll(['bgm']);
    }
  },

  resumeGame() {
    if (this.startedGame && !this.timerRunning) {
      this.showQuestions(true);
      this.timerRunning = true;
      this.countTime();
      //this.startFalling();
    }
  },

  addScore(mark) {
    let currentScore = this.score;
    let newScore = this.score + mark;

    if (newScore < 0)
      newScore = 0;

    if (newScore >= 30 && newScore < 60) {
      this.starNum = 1;
      View.showSuccess();
    }
    else if (newScore >= 60 && newScore <= 90) {
      this.starNum = 2;
    }
    else if (newScore > 90) {
      this.starNum = 3;
    }
    else {
      View.showFailure();
    }

    this.score = newScore;
    //View.scoreText.innerText = this.score;
    this.countUp(View.scoreText, currentScore, this.score, 1000);
    //View.finishedScore.innerText = this.score;
  },

  countUp(displayElement, start, end, duration, playEffect = true, unit = "", updateTextColor = true, updateColor = 'yellow', originalColor = 'white') {
    let startTime = null;
    let lastSoundTime = 0;
    const soundInterval = 200;

    function animate(timestamp) {
      if (!startTime) {
        startTime = timestamp;
        if (updateTextColor) displayElement.style.color = updateColor;
      }
      const progress = timestamp - startTime;
      // Calculate the current value based on the start value
      const current = Math.min(Math.floor((progress / duration) * (end - start) + start), end);
      displayElement.innerText = current + unit;

      if (current < end) {
        if (State.isSoundOn && (timestamp - lastSoundTime >= soundInterval) && playEffect) {
          Sound.play('score');
          lastSoundTime = timestamp; // Update the last sound time
        }
        requestAnimationFrame(animate);
      }
      else {
        if (updateTextColor) displayElement.style.color = originalColor;
      }
    }
    requestAnimationFrame(animate);
  },

  showFinalStars() {
    const delayPerStar = 200;
    const star1 = document.getElementById("star1");
    const star2 = document.getElementById("star2");
    const star3 = document.getElementById("star3");

    if (this.starNum === 1) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500);
    }
    else if (this.starNum === 2) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500, () => {
        setTimeout(() => {
          star2.classList.add('show');
          this.scaleStarUp(star2, 500);
        }, delayPerStar);
      });
    }
    else if (this.starNum === 3) {
      star1.classList.add('show');
      this.scaleStarUp(star1, 500, () => {
        setTimeout(() => {
          star2.classList.add('show');
          this.scaleStarUp(star2, 500, () => {
            setTimeout(() => {
              star3.classList.add('show');
              this.scaleStarUp(star3, 500);
            }, delayPerStar);
          });
        }, delayPerStar);
      });
    }
  },

  scaleStarUp(starElement, duration, callback = null) {
    let start = null;
    const initialScale = 0;
    const finalScale = 1;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const scale = Math.min(initialScale + (progress / duration), finalScale);
      starElement.style.transform = `scale(${scale})`;
      starElement.style.opacity = scale;

      if (scale < finalScale) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    }

    requestAnimationFrame(animate);
  },

  startCountTime() {
    if (!this.startedGame) {
      this.time = this.remainingTime;
      this.startedGame = true;
    }

    if (!this.timerRunning) {
      this.showQuestions(true);
      this.timerRunning = true;
      this.finishedCreateOptions = false;
      this.countTime();
    }
  },

  countTime() {
    if (this.timerRunning) {
      if (this.nextQuestion) {
        this.setQuestions();
        this.nextQuestion = false;
      }
      this.time--;
      this.updateTimerDisplay(this.time);
      //logController.log(this.usedColumn);

      if (this.time <= 10 && !this.isPlayLastTen) {
        if (State.isSoundOn) {
          Sound.play('lastTen', true);
          //logController.log('play last ten!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
        View.timeText.classList.add('lastTen');
        this.isPlayLastTen = true;
      }

      if (this.time <= 0) {
        this.finishedGame();
      } else {
        this.timer = setTimeout(this.countTime.bind(this), 1000);
      }
    }
  },
  stopCountTime() {
    if (this.timerRunning) {
      clearInterval(this.timer);
      this.timerRunning = false;
      this.showQuestions(false);
    }
  },
  updateTimerDisplay(countdownTime) {
    // Calculate the minutes and seconds
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    //logController.log("count", timeString);
    View.timeText.innerText = timeString;
  },
  getTranslateYValue(transformStyle) {
    const translateYRegex = /translateY\((-?\d+\.?\d*)px\)/;
    const match = transformStyle.match(translateYRegex);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return 0;
  },
  generateUniqueId() {
    return Math.random().toString(16).slice(2);
  },
  createPlate() {

  },
  createRandomItem(char, optionImage) {
    if (char && char.length !== 0 && this.boxesArea.length !== 0 && this.boxesArea) {
      //console.log(this.boxesArea);
      const enabledBoxes = this.boxesArea.filter((box, index) => this.boxStatus[index]);

      if (!this.createdOptionId || this.createdOptionId >= enabledBoxes.length) {
        this.createdOptionId = 0;
      }
      const selectedBox = enabledBoxes[this.createdOptionId];
      const id = selectedBox.id;
      const x = selectedBox.x;
      const size = selectedBox.width;

      this.renderOptionOutline(size, x, id);
      this.renderPlateItem(size, x);

      const word = char;
      const generatePosition = () => {
        const x = selectedBox.x + selectedBox.width * 0.093;
        const size = selectedBox.width * 0.8;
        const optionWrapper = this.createOptionWrapper(word, id, size, optionImage, this.createdOptionId);
        const newObjectItem = {
          x,
          size: size,
          img: optionImage,
          optionWrapper,
          id,
        };
        this.createdOptionId++;
        return newObjectItem;
      };

      const newObjectItem = generatePosition();
      this.objectItems.push(newObjectItem);
      this.renderItem(newObjectItem);
    }
  },
  generatePositionX(columnId) {
    if (this.wholeScreenColumnSeperated) {
      const offset = 20;
      // Calculate the X position based on the columnId
      let positionX = columnId * this.columnWidth + offset; // Center the position within the column

      if (positionX + this.columnWidth / 2 > View.canvas.width - offset) {
        positionX = View.canvas.width - offset - this.columnWidth / 2;
      }
      return positionX;
    }
    else {
      const isLeft = columnId < Math.floor(this.redBoxX / this.optionSize);
      let numColumns, columnWidth;

      if (isLeft) {
        numColumns = Math.floor(this.redBoxX / this.optionSize);
        columnWidth = this.redBoxX / numColumns;
        return columnId * columnWidth + 15;
      } else {
        numColumns = Math.floor((View.canvas.width - this.redBoxX - this.redBoxWidth - 10) / this.optionSize);
        columnWidth = (View.canvas.width - this.redBoxX - this.redBoxWidth - 10) / numColumns;
        return this.redBoxX + this.redBoxWidth + (columnId - Math.floor(this.redBoxX / this.optionSize)) * columnWidth;
      }
    }
  },
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  createOptionWrapper(text, id, size, optionImage, columnId) {
    let optionWrapper = document.createElement('div');
    optionWrapper.classList.add('optionWrapper');
    optionWrapper.style.width = `${size}px`;
    optionWrapper.style.height = `${size}px`;
    if (optionImage !== '' && optionImage !== 'undefined') {
      //logController.log("created option image url:", optionImage);
      optionWrapper.style.backgroundImage = `url(${optionImage})`;
    }
    optionWrapper.id = id;
    optionWrapper.setAttribute('word', text);
    optionWrapper.setAttribute('column', columnId);
    let option = document.createElement('span');
    option.classList.add('option');
    let formattedText = '';

    switch (this.lang) {
      case "0":
        formattedText = text.split(' ').join('<br>'); // Replace spaces with <br>
        option.innerHTML = formattedText; // Use innerHTML to include <br>
        optionWrapper.classList.add("engOpt");
        break;
      case "1":
        formattedText = text;
        option.textContent = formattedText;
        optionWrapper.classList.add("chOpt");
        break;
      default:
        formattedText = text.split(' ').join('<br>'); // Replace spaces with <br>
        option.innerHTML = formattedText; // Use innerHTML to include <br>
        optionWrapper.classList.add("engOpt");
        break;
    }

    optionWrapper.appendChild(option);
    let fontSize = this.engFontSize;
    let lineHeightMultiplier = 1;
    option.style.fontSize = `${fontSize}px`;
    option.style.lineHeight = `${fontSize * lineHeightMultiplier}px`;
    return optionWrapper;
  },
  getRandomQuestions(string) {
    const randomIndex = Math.floor(Math.random() * string.length);
    return string[randomIndex];
  },
  renderItem(item) {
    View.optionArea.appendChild(item.optionWrapper);
    item.optionWrapper.classList.add("show");
    item.optionWrapper.style.left = item.x + 'px';
  },
  renderOptionOutline(size, positionX, id) {
    var outline = document.createElement('div');
    outline.classList.add("optionOutline");
    View.optionArea.appendChild(outline);
    outline.id = "outlineId_"+ id;
    outline.style.width = size + 'px';
    outline.style.height = size * 2.5 + 'px';
    outline.style.left = positionX + 'px';

    var progressBar = document.createElement('div');
    progressBar.classList.add("optionProgressBar");
    var progress = document.createElement('div');
    progress.classList.add("progressIndicator");
    progress.id = "progressId_"+ id;
    progressBar.appendChild(progress);
    View.optionArea.appendChild(progressBar);
    progressBar.style.width = size * 0.85 + 'px';
    progressBar.style.height = size * 0.12 + 'px';
    progressBar.style.left = positionX + 'px';
  },
  renderPlateItem(size, positionX) {
    var plate = document.createElement('div');
    plate.classList.add("optionPlate");
    View.optionArea.appendChild(plate);
    plate.style.width = size + 'px';
    plate.style.height = size + 'px';
    plate.style.left = positionX + 'px';
  },
  removeItem(item) {
    const index = this.objectItems.findIndex(i => i.optionWrapper === item);
    if (index !== -1) {
      this.objectItems.splice(index, 1);
      View.optionArea.removeChild(item);
    }
  },
  removeItemByIndex(id) {
    const item = this.objectItems.find(item => item.id === id);
    if (item) {
      const index = this.objectItems.indexOf(item);
      this.objectItems.splice(index, 1);
      View.optionArea.removeChild(item.optionWrapper);
    }
  },
  /////////////////////////////////////////Random Questions///////////////////////////////
  randQuestion() {
    if (this.questionType === null || this.questionType === undefined)
      return null;

    let questions = this.questionType.questions;
    this.totalQuestions = questions.length;
    if (this.randomQuestionId === 0) {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    logController.log("questions", questions[this.randomQuestionId]);
    const _type = questions[this.randomQuestionId].questionType;
    const _QID = questions[this.randomQuestionId].qid;
    const _question = questions[this.randomQuestionId].question;
    const _answers = questions[this.randomQuestionId].answers;
    let _correctAnswer = questions[this.randomQuestionId].correctAnswer;
    const _star = this.apiManager.isLogined ? questions[this.randomQuestionId].star : null;
    const _score = this.apiManager.isLogined ? questions[this.randomQuestionId].score.full : null;
    const _correctAnswerIndex = this.apiManager.isLogined ? questions[this.randomQuestionId].correctAnswerIndex : null;
    const _media = this.apiManager.isLogined ? questions[this.randomQuestionId].media : null;

    if ((questions[this.randomQuestionId].correctAnswer === null || questions[this.randomQuestionId].correctAnswer === undefined)
      && _answers) {
      _correctAnswer = _answers[_correctAnswerIndex];
    }

    if (this.randomQuestionId < this.totalQuestions - 1) {
      this.randomQuestionId += 1;
    }
    else {
      this.randomQuestionId = 0;
    }
    //logController.log("answered count", this.answeredNum);
    return {
      QuestionType: _type,
      QID: _QID,
      Question: _question,
      Answers: _answers,
      CorrectAnswer: _correctAnswer,
      Star: _star,
      Score: _score,
      CorrectAnswerId: _correctAnswerIndex,
      Media: _media,
    };
  },
  generateCharArray(word) {
    var chars = word.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars;
  },
  randomizeAnswers(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    return array.slice().sort(() => Math.random() - 0.5);
  },

  randomOptions() {
    //logController.log('question class', this.randomQuestion);
    this.answerLength = 1;
    return this.randomizeAnswers(this.randomQuestion.Answers);
  },

  randomizeBoxStatus(numBoxesVisible = 4) {
    this.boxStatus.fill(true);
    let disableBoxesNumber = this.maxBoxes - numBoxesVisible;
    const indices = Array.from(Array(this.maxBoxes).keys());
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]; // Swap
    }
    for (let i = 0; i < disableBoxesNumber; i++) {
      this.boxStatus[indices[i]] = false;
    }
  },
  setQuestions() {
    this.randomQuestion = this.randQuestion();
    logController.log(this.randomQuestion);
    if (this.randomQuestion === null)
      return;
    this.randomizeBoxStatus(this.randomQuestion.Answers.length);

    this.question = this.randomQuestion.Question;
    this.randomPair = this.randomOptions();
    this.questionWrapper = document.createElement('div');
    let questionBg = document.createElement('div');
    this.answerTextField = document.createElement('div');
    switch (this.lang) {
      case "0":
        this.questionWrapper.classList.add("eng");
        this.answerTextField.classList.add("engAns");
        break;
      case "1":
        this.questionWrapper.classList.add("ch");
        this.answerTextField.classList.add("chAns");
        break;
      default:
        this.questionWrapper.classList.add("eng");
        this.answerTextField.classList.add("engAns");
        break;
    }

    switch (this.randomQuestion.QuestionType) {
      case 'fillInBlank':
      case 'text':
        this.questionWrapper.classList.add('questionFillBlankWrapper');
        questionBg.classList.add('questionImgBg');
        View.stageImg.appendChild(questionBg);
        var questionText = document.createElement('span');
        questionText.textContent = this.randomQuestion.Question;
        this.questionWrapper.appendChild(questionText);
        var fontSize = `calc(min(max(4vh, 6vh - ${this.randomQuestion.Question.length} * 0.1vh), 6vh))`;
        this.questionWrapper.style.setProperty('--question-font-size', fontSize);
        this.answerTextField.classList.add('pictureType');
        break;
      case 'audio':
        this.questionWrapper.classList.add('questionAudioWrapper');
        questionBg.classList.add('questionAudioBg');
        View.stageImg.appendChild(questionBg);
        /*var questionText = document.createElement('span');
        questionText.textContent = this.randomQuestion.question;
        this.questionWrapper.appendChild(questionText);
        var fontSize = `calc(min(max(4vh, 6vh - ${this.randomQuestion.question.length} * 0.1vh), 6vh))`;
        this.questionWrapper.style.setProperty('--question-font-size', fontSize);*/

        this.buttonWrapper = document.createElement('button');
        this.buttonWrapper.classList.add('buttonWrapper');
        this.buttonWrapper.classList.add('audioPlay');
        this.buttonWrapper.addEventListener('mousedown', () => {
          this.buttonWrapper.classList.add('clicked');
          this.buttonWrapper.classList.remove('not-clicked');
          this.playWordAudio(this.randomQuestion.QID);
        });

        this.buttonWrapper.addEventListener('mouseup', () => {
          this.buttonWrapper.classList.remove('clicked');
          this.buttonWrapper.classList.add('not-clicked');
        });
        this.buttonWrapper.addEventListener('touchstart', (event) => {
          event.preventDefault(); // Prevent default touch behavior
          this.buttonWrapper.classList.add('clicked');
          this.buttonWrapper.classList.remove('not-clicked');
          this.playWordAudio(this.randomQuestion.QID);
        });

        this.buttonWrapper.addEventListener('touchend', (event) => {
          event.preventDefault(); // Prevent default touch behavior
          this.buttonWrapper.classList.remove('clicked');
          this.buttonWrapper.classList.add('not-clicked');
        });
        this.questionWrapper.appendChild(this.buttonWrapper);
        this.answerTextField.classList.add('audioType');

        if (this.randomQuestion.QID && this.randomQuestion.QID.trim() !== '') {
          this.playWordAudio(this.randomQuestion.QID);
          //logController.log('audio', this.randomQuestion.QID);
        }
        break;
      case 'picture':
        this.questionWrapper.classList.add('questionImageWrapper');
        questionBg.classList.add('questionImgBg');
        View.stageImg.appendChild(questionBg);

        if (QuestionManager.preloadedImagesItem && QuestionManager.preloadedImagesItem.length > 0) {
          //let imageFile = imageFiles.find(([name]) => name === this.questionWord.QID);
          let currentImagePath = '';
          let imageFile = null;
          QuestionManager.preloadedImagesItem.forEach((img) => {
            if (img.id === this.randomQuestion.QID) {
              imageFile = img.src;
              //logController.log("imageFile", imageFile);
            }
          });

          if (imageFile) {
            currentImagePath = imageFile;
            var imageElement = document.createElement('img');
            imageElement.src = currentImagePath;
            imageElement.alt = 'image';
            imageElement.classList.add('questionImage');
            this.questionWrapper.appendChild(imageElement);
          }
        }
        this.answerTextField.classList.add('pictureType');
        break;
    }

    logController.log("this.randomQuestion.answers", this.randomQuestion.Answers);

    this.answerTextField.classList.add('answerWrapper');
    this.answerWrapper = document.createElement('span');
    this.answerWrapper.classList.add('answerText');
    this.answerTextField.appendChild(this.answerWrapper);
    View.stageImg.appendChild(this.questionWrapper);
    View.stageImg.appendChild(this.answerTextField);
    View.stageImg.classList.add('fadeIn');
    View.stageImg.style.opacity = 1;

    var table = document.createElement('div');
    table.classList.add("table");
    View.optionArea.appendChild(table);

    for (let i = 0; i < this.randomPair.length; i++) {
      var optionImageId = i % View.preloadedFallingImages.length;
      this.createRandomItem(this.randomPair[i], View.preloadedFallingImages[optionImageId]);
    }

    State.changeState('playing', 'waitAns');
  },

  adjustAnswerTextFontSize(answer) {
    if (this.answerWrapper) {
      const textLength = answer.length;
      let fontSize;
      // Base font size
      const baseFontSize = 26; // Adjust this value as needed

      // Set font size based on text length
      if (textLength <= 10) {
        fontSize = baseFontSize; // Maximum size for short text
      } else if (textLength <= 20) {
        fontSize = baseFontSize * 0.8; // Scale down for medium-length text
      } else if (textLength <= 30) {
        fontSize = baseFontSize * 0.6; // Further scale down for longer text
      } else {
        fontSize = baseFontSize * 0.4; // Minimum size for very long text
      } 3
      this.answerWrapper.style.fontSize = `${fontSize}px`;
    }
  },

  motionTriggerPlayAudio(_play) {
    if (_play) {
      this.buttonWrapper.classList.add('clicked');
      this.buttonWrapper.classList.remove('not-clicked');
      this.playWordAudio(this.randomQuestion.QID);
    }
    else {
      this.buttonWrapper.classList.add('not-clicked');
      this.buttonWrapper.classList.remove('clicked');
    }
  },

  playWordAudio(QID, onCompleted = null) {
    // Add your button click event handler logic here
    if (State.isSoundOn) {
      Sound.stopAll(['bgm', 'lastTen']);
      Sound.play(QID, false, null, onCompleted);
    }
  },

  showQuestions(status) {
    View.stageImg.style.display = status ? '' : 'none';
    View.optionArea.style.opacity = status ? '1' : '0';
  },
  finishedGame() {
    this.stopCountTime();
    View.timeText.classList.remove('lastTen');
    State.changeState('finished');
    this.startedGame = false;
  },
  fillWord(optionId = null) {
    if (optionId === null || this.objectItems === null || this.objectItems.length === 0) {
      logController.error("objectItems", this.objectItems);
      logController.warn("Invalid optionId or objectItems is null/empty.");
      return;
    }
    const option = this.objectItems.find(item => item.id === optionId).optionWrapper;
    if (option === undefined || !option) {
      logController.warn("Option wrapper is undefined or null.");
      return;
    }
    if (this.answerWrapper) {
      if (this.fillwordTime < this.answerLength) {
        this.answerWrapper.textContent += option.getAttribute('word');
        this.adjustAnswerTextFontSize(this.answerWrapper.textContent);
        State.changeState('playing', 'checkingQuestion');
        if (this.questionType.type === "MultipleChoice") {
          if (View.optionArea.contains(option)) {
            option.classList.remove('show');
          }
        }
        else {
          option.classList.add('hide');
          setTimeout(() => {
            option.classList.remove('show');  // Remove the show class
          }, 500);
          //option.classList.remove('show');
          //this.typedItems.push(option);
        }

        this.fillwordTime += 1;
        if (State.isSoundOn) {
          Sound.stopAll(['bgm', 'lastTen']);
          Sound.play('btnClick');
        }
        if (this.fillwordTime == this.answerLength) {
          setTimeout(() => {
            this.checkAnswer(this.answerWrapper.textContent);
          }, 300);
        }
      }
    }
  },
  resetFillWord() {
    this.randomPair = this.randomOptions();
    this.clearWrapper();
  },
  backSpaceWord() {
    let answerText = this.answerWrapper.textContent;
    if (!this.isTriggeredBackSpace && answerText.length > 0) {
      this.isTriggeredBackSpace = true;
      this.answerWrapper.textContent = answerText.slice(0, -1);
      this.fillwordTime = answerText.length - 1;

      let delay = 1000;
      let lastOption = null;
      if (this.typedItems.length > 0) {
        lastOption = this.typedItems[this.typedItems.length - 1];
        //logController.log('lastOption', lastOption);

        if (lastOption && !lastOption.classList.contains('show')) {
          const columnId = this.getBalancedColumn();
          lastOption.x = this.generatePositionX(columnId);
          lastOption.classList.add('show');
        }
        this.typedItems.pop();
      }

      //let hiddenedOption = this.objectItems.filter(item => item.optionWrapper.getAttribute('word') === lastChar);
      setTimeout(() => {
        //logController.log("this.typedItems", this.typedItems);
        this.isTriggeredBackSpace = false;
      }, delay);
    }
  },
  clearWrapper() {
    this.createdOptionId = 0;
    this.leftCount = 0;
    this.rightCount = 0;
    this.answerTextField.classList.remove('correct');
    this.answerTextField.classList.remove('wrong');
    this.answerWrapper.textContent = '';
    this.fillwordTime = 0;
    this.objectItems.splice(0);
    View.optionArea.innerHTML = '';
    this.typedItems.splice(0);
  },
  clearOption() {
    this.createdOptionId = 0;
    this.leftCount = 0;
    this.rightCount = 0;
    this.fillwordTime = 0;
    this.objectItems.splice(0);
    View.optionArea.innerHTML = '';
    this.typedItems.splice(0);
  },
  moveToNextQuestion() {
    View.preloadedFallingImages.sort(() => Math.random() - 0.5);
    this.randomQuestion = null;
    this.randomPair = [];
    this.clearWrapper();
    View.stageImg.innerHTML = '';
    setTimeout(() => {
      this.nextQuestion = true;
    }, 500);
  },
  ////////////////////////////Added Submit Answer API/////////////////////////////////////////////////////
  checkAnswer(answer) {
    const isCorrect = answer.toLowerCase() === this.randomQuestion.CorrectAnswer.toLowerCase();
    const eachQAScore = this.getScoreForQuestion();

    if (isCorrect) {
      //答岩1分，答錯唔扣分
      this.addScore(eachQAScore);
      this.answerTextField.classList.add('correct');
      State.changeState('playing', 'ansCorrect');
      View.showCorrectEffect(true);
      if (this.lang === "1" && this.lang) {
        State.isPlayingAudio = true;
        this.playWordAudio(this.randomQuestion.QID, () => {
          State.isPlayingAudio = false;
          this.moveToNextQuestion();
        });
      }
    } else {
      //this.addScore(-1);
      this.answerTextField.classList.add('wrong');
      State.changeState('playing', 'ansWrong');
      View.showWrongEffect(true);
    }

    this.updateAnsweredProgressBar(() => {
      //logController.log("finished question");
      this.finishedGame();
      return null;
    });

    this.uploadAnswerToAPI(answer, this.randomQuestion, eachQAScore); ////submit answer api//////
  },
  getScoreForQuestion() {
    return this.randomQuestion.Score ? this.randomQuestion.Score : this.eachQAMark;
  },
  answeredPercentage() {
    if (this.totalQuestions === 0) return 0;
    return (this.correctedAnswerNumber / this.totalQuestions) * 100;
  },
  uploadAnswerToAPI(answer, currentQuestion, eachMark) {
    if (!this.apiManager || !this.apiManager.isLogined || answer === '') return;
    logController.log(`Game Time: ${this.remainingTime}, Remaining Time: ${this.time}`);
    const currentTime = this.calculateCurrentTime();
    const progress = this.calculateProgress();
    const { correctId, score, currentQAPercent } = this.calculateAnswerMetrics(answer, eachMark);
    const answeredPercentage = this.calculateAnsweredPercentage();
    this.apiManager.SubmitAnswer(
      currentTime,
      this.score,
      answeredPercentage,
      progress,
      correctId,
      currentTime,
      currentQuestion.QID,
      currentQuestion.CorrectAnswerId,
      answer,
      currentQuestion.CorrectAnswer,
      score,
      currentQAPercent
    );
  },
  calculateCurrentTime() {
    return Math.floor(((this.remainingTime - this.time) / this.remainingTime) * 100);
  },
  calculateProgress() {
    return Math.floor((this.answeredNum / this.totalQuestions) * 100);
  },
  calculateAnswerMetrics(answer, eachMark) {
    let correctId = 0;
    let score = 0;
    let currentQAPercent = 0;

    if (answer.toLowerCase() === this.randomQuestion.CorrectAnswer.toLowerCase()) {
      this.correctedAnswerNumber = Math.min(this.correctedAnswerNumber + 1, this.totalQuestions);
      correctId = 2;
      score = eachMark;
      currentQAPercent = 100;
    }
    //logController.log("Corrected Answer Number: ", this.correctedAnswerNumber);
    return { correctId, score, currentQAPercent };
  },
  calculateAnsweredPercentage() {
    return this.correctedAnswerNumber < this.totalQuestions
      ? this.answeredPercentage(this.totalQuestions)
      : 100;
  },

  updateAnsweredProgressBar(onCompleted = null) {
    if (this.apiManager.isLogined) {
      let progress = 0;

      // Increment answered questions and calculate progress
      if (this.answeredNum < this.totalQuestions) {
        this.answeredNum += 1;
        progress = this.answeredNum / this.totalQuestions;
      } else {
        progress = 1;
      }

      let progressColorBar = document.getElementById("progressColorBar");
      let progressText = document.querySelector('.progressText');

      if (progressColorBar) {
        let rightPosition = (100 - (progress * 100)) + "%";
        progressColorBar.style.setProperty('--progress-right', rightPosition);
        // Show the progress in the format "answered/total"
        progressText.innerText = `${this.answeredNum}/${this.totalQuestions}`;

        if (progress >= 1) {
          setTimeout(() => {
            if (onCompleted) onCompleted();
          }, 500);
        }
      }
    }
  },

  resetProgressBar() {
    if (this.apiManager.isLogined) {
      this.answeredNum = 0; // Reset answered questions
      let progressColorBar = document.getElementById("progressColorBar");
      let progressText = document.querySelector('.progressText');

      if (progressColorBar) {
        progressColorBar.style.setProperty('--progress-right', "100%"); // Reset position
      }

      if (progressText) {
        progressText.textContent = "0/" + this.totalQuestions; // Reset text to show answered/total format
      }
    }
  }
}
