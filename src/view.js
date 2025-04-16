import Game from './StayToEat';
import State from './state';
import { logController } from './logController';

export default {
  //-----------------------------------------------------------------------------------------------
  lang: null,
  renderer: null,
  loadingBarWrapper: document.querySelector('.loadingBarWrapper'),
  instructionWrapper: document.querySelector('.instructionWrapper'),
  canvasWrapper: document.querySelector('.canvasWrapper'),
  canvas: document.querySelector('.canvasWrapper > canvas'),
  gameWrapper: document.querySelector('.gameWrapper'),
  prepareBoard: document.querySelector('.gameWrapper > .prepareBoardWrapper'),
  //outBoxBoard: document.querySelector('.gameWrapper > .outBoxBoardWrapper'),
  countImg: document.querySelector('.gameWrapper > .count'),
  stageImg: document.querySelector('.gameWrapper > .questionBoard'),
  startBtn: document.querySelector('.startBtn'),

  ruleBtn: document.querySelector('.gameWrapper > .topRightControl > .ruleBtn'),
  ruleCloseBtn: document.querySelector('.gameWrapper > .topRightControl > .ruleBox > .closeBtn'),
  ruleBox: document.querySelector('.gameWrapper > .topRightControl > .ruleBox'),
  ruleHints: document.querySelector('.gameWrapper > .topRightControl > .ruleBox > .hints'),

  motionBtn: document.querySelector('.gameWrapper > .topRightControl  > .motionBtn'),

  musicBtn: document.querySelector('.gameWrapper > .topRightControl > .musicBtn'),
  exitBtn: document.querySelector('.gameWrapper > .topRightControl > .exitBtn'),
  tips: document.querySelector('.gameWrapper > .topRightControl > .tips'),
  poleImg: document.querySelector('.gameWrapper > .flagWrapper > .pole'),
  flagImg: document.querySelector('.gameWrapper > .flagWrapper > .flag'),
  finishedWrapper: document.querySelector('.finishedWrapper'),
  finishedBoardWrapper: document.querySelector('.finishedWrapper > .finishedBoardWrapper'),
  finishedBoard: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBoard'),
  savePhotoBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .savePhotoBtn'),
  backHomeBtnOfFinished: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .backHomeBtn'),
  playAgainBtn: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .finishedBtnWrapper > .playAgainBtn'),
  backHomeBtnOfExit: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .backHomeBtn'),

  loginErrorWrapper: document.querySelector('.loginErrorWrapper'),
  reloadBtn: document.querySelector('.loginErrorWrapper > .loginErrorBoard  > .errorWrapper > .reloadBtn'),

  musicOnOffWrapper: document.querySelector('.musicOnOffWrapper'),
  musicOnOffBoard: document.querySelector('.musicOnOffWrapper > .musicOnOffBoard'),
  onBtn: document.querySelector('.musicOnOffWrapper > .musicOnOffBoard  > .musicWrapper > .onBtn'),
  offBtn: document.querySelector('.musicOnOffWrapper > .musicOnOffBoard  > .musicWrapper > .offBtn'),
  exitWrapper: document.querySelector('.exitWrapper'),
  continuebtn: document.querySelector('.exitWrapper > .exitBoard  > .btnWrapper > .continueBtn'),
  optionArea: document.querySelector('.canvasWrapper > .optionArea'),
  debug: document.querySelector('.debug'),
  stageStar: document.querySelector('.gameWrapper > .topLeftControl > .stageWrapper > .stageStar'),
  scoreBoard: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreBoard'),
  scoreText: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .scoreText'),
  playerName: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .playerName'),
  playerNameText: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .playerName > .playerNameText'),
  playerNameBox: document.querySelector('.gameWrapper > .topLeftControl > .scoreWrapper > .playerName > .playerNameBox'),

  timeText: document.querySelector('.gameWrapper > .topLeftControl > .timeWrapper > .timeText'),
  finishedScore: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.score > .value'),
  finishedTime: document.querySelector('.finishedWrapper > .finishedBoardWrapper > .scoreTimeWrapper > .row.time > .value'),
  topLeftControl: document.querySelector('.gameWrapper > .topLeftControl'),
  selectCounts: document.querySelectorAll('.canvasWrapper > .optionArea > .optionWrapper > .selectCount'),

  headTracker: document.getElementById('head'),
  eatAnimated: document.getElementById('foodAnimated'),
  playerIcon: document.getElementById('userIcon'),
  fpsModeBtn: document.getElementById('fpsButton'),
  gameTitle: document.getElementById('game-title'),

  progressBarWrapper: document.querySelector('.progressBarWrapper'),
  instructionContent: document.querySelector('.instructionBoard > .instructionRule > .instructionContent'),
  rule: document.querySelector('.gameWrapper > .prepareBoardWrapper > .rule'),
  //-----------------------------------------------------------------------------------------------
  preloadedFallingImages: [],

  optionImages: {
    en: [
      require("./images/StayToEat/cakes/cake_1.png"),
      require("./images/StayToEat/cakes/cake_2.png"),
      require("./images/StayToEat/cakes/cake_3.png"),
      require("./images/StayToEat/cakes/cake_4.png"),
    ],
    ch: [
      require("./images/StayToEat/cakes/cake_1.png"),
      require("./images/StayToEat/cakes/cake_2.png"),
      require("./images/StayToEat/cakes/cake_3.png"),
      require("./images/StayToEat/cakes/cake_4.png"),
    ],
  },

  toAPIImageUrl(url) {
    if (url === null) return;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Get the image as a Blob
      })
      .then(blob => {
        let successUrl = URL.createObjectURL(blob);
        logController.log("success blob", successUrl);
        this.preloadedFallingImages.push(successUrl);
      })
      .catch(error => {
        logController.error("Error loading image:", error);
      });
  },
  preloadUsedImages(option_images = null) {
    let logined = option_images !== null ? true : false;
    let defaultOptionImages = this.lang === "0" ? this.optionImages.en : this.optionImages.ch;
    let _optionImages = logined ? option_images : defaultOptionImages;
    _optionImages.forEach((path) => {
      this.toAPIImageUrl(path);
    });
  },

  showInstruction() {
    this.instructionWrapper.style.top = 0;
  },
  hideInstruction() {
    this.instructionWrapper.style.top = '-100vh';
  },
  //-----------------------------------------------------------------------------------------------
  showCanvas() {
    this.canvasWrapper.style.visibility = "visible";
    this.canvasWrapper.style.opacity = 1;
  },
  hideCanvas() {
    this.canvasWrapper.style.opacity = 0;
    setTimeout(() => {
      this.canvasWrapper.style.visibility = "visible";
    }, 500);
  },
  //-----------------------------------------------------------------------------------------------
  showGame() {
    this.gameWrapper.style.top = 0;
  },
  hideGame() {
    this.gameWrapper.style.top = '-100vh';
  },
  //-----------------------------------------------------------------------------------------------
  showPrepareBoard() {
    this.prepareBoard.style.opacity = 1;
  },
  hidePrepareBoard() {
    this.prepareBoard.style.opacity = 0;
  },
  //-----------------------------------------------------------------------------------------------
  /*showOutBoxBoard() {
    this.outBoxBoard.style.opacity = 1;
  },
  hideOutBoxBoard() {
    this.outBoxBoard.style.opacity = 0;
  },*/
  //-----------------------------------------------------------------------------------------------
  showCount(num) {
    this.countImg.classList.add("count", "c" + num);

    if (num === 0) {
      switch (this.lang) {
        case "0":
          this.countImg.classList.add("eng");
          break;
        case "1":
          this.countImg.classList.add("ch");
          break;
        default:
          this.countImg.classList.add("eng");
          break;
      }
    }
    //this.countImg.style.opacity = 1;
    //this.countImg.style.maxHeight = "calc(min(60vh, 60vw))";
    setTimeout(() => this.hideCount(num), 750);
  },
  hideCount(num) {
    this.countImg.classList.remove("count", "c" + num);
    //this.countImg.style.opacity = 0;
    //this.countImg.style.maxHeight = "";
  },
  //-----------------------------------------------------------------------------------------------
  showStage() {
    Game.addScore(0);
    this.stageStar.className = "stageStar stage" + Game.stage
    //this.scoreBoard.className ="scoreBoard stage" + Game.stage;

    this.stageImg.className = "stage s" + Game.stage;
    this.stageImg.style.opacity = 1;
    this.stageImg.style.maxHeight = "calc(min(40vh, 40vw))";
    setTimeout(() => this.hideStage(), 600);
  },
  hideStage() {
    this.stageImg.style.opacity = 0;
    this.stageImg.style.maxHeight = "";
  },
  //-----------------------------------------------------------------------------------------------
  showFinished() {
    this.finishedWrapper.classList.add("show");
  },
  hideFinished() {
    this.finishedWrapper.classList.remove("show");
    setTimeout(() => {
      this.finishedScore.innerText = "0";
      //this.finishedTime.innerText = "";
    }, 1000);
  },
  showSuccess() {
    this.finishedBoard.classList.remove("fail");
    this.finishedBoard.classList.add("success");
    switch (this.lang) {
      case "0":
        this.playAgainBtn.classList.add('engReplay');
        this.backHomeBtnOfFinished.classList.add('engBack');
        this.finishedBoard.classList.add('engSuccess');
        break;
      case "1":
        this.playAgainBtn.classList.add('chReplay');
        this.backHomeBtnOfFinished.classList.add('chBack');
        this.finishedBoard.classList.add('chSuccess');
        break;
      default:
        this.playAgainBtn.classList.add('engReplay');
        this.backHomeBtnOfFinished.classList.add('engBack');
        this.finishedBoard.classList.add('engSuccess');
        break;
    }
  },
  hideSuccess() {
    this.finishedBoard.classList.remove("success");
  },
  showFailure() {
    this.finishedBoard.classList.remove("success");
    this.finishedBoard.classList.add("fail");
    switch (this.lang) {
      case "0":
        this.playAgainBtn.classList.add('engReplay');
        this.backHomeBtnOfFinished.classList.add('engBack');
        this.finishedBoard.classList.add('engFail');
        break;
      case "1":
        this.playAgainBtn.classList.add('chReplay');
        this.backHomeBtnOfFinished.classList.add('chBack');
        this.finishedBoard.classList.add('chFail');
        break;
      default:
        this.playAgainBtn.classList.add('engReplay');
        this.backHomeBtnOfFinished.classList.add('engBack');
        this.finishedBoard.classList.add('engFail');
        break;
    }
  },
  hideFailure() {
    this.finishedBoard.classList.remove("fail");
  },
  showMusicOnOff() {
    this.musicOnOffWrapper.classList.add("show");
  },
  hideMusicOnOff() {
    this.musicOnOffWrapper.classList.remove("show");
  },
  showLoginErrorPopup() {
    this.loginErrorWrapper.classList.add("show");
  },
  hideLoginErrorPopup() {
    this.loginErrorWrapper.classList.remove("show");
  },
  //-----------------------------------------------------------------------------------------------
  showExit() {
    this.exitWrapper.classList.add("show");
  },
  //-----------------------------------------------------------------------------------------------
  hideExit() {
    this.exitWrapper.classList.remove("show");
  },
  //-----------------------------------------------------------------------------------------------
  showTips(tipsName) {
    this.tips.className = "tips " + tipsName;
    //this.tips.classList.add(tipsName);
  },
  //-----------------------------------------------------------------------------------------------
  hideTips() {
    this.tips.className = "tips";
    //this.tips.classList.remove(tipsName);
  },
  //-----------------------------------------------------------------------------------------------
  showTopLeftControl() {
    this.topLeftControl.className = "topLeftControl";
  },
  //-----------------------------------------------------------------------------------------------
  hideTopLeftControl() {
    this.topLeftControl.className = "topLeftControl hide";
  },
  //-----------------------------------------------------------------------------------------------
  showAnsResult(result) {
    let correct = document.querySelector('.gameWrapper > .ansResult > .ans.correct');
    if (correct) {
      correct.classList.remove('show');
      if (result == 'correct') correct.classList.add('show');
    }
    let wrong = document.querySelector('.gameWrapper > .ansResult > .ans.wrong');
    if (wrong) {
      wrong.classList.remove('show');
      if (result == 'wrong') wrong.classList.add('show');
    }

    //顯示所選答案的color border
    for (let optionWrapper of document.querySelectorAll('.optionWrapper')) {
      if (optionWrapper.classList.contains('showColorBorder')) optionWrapper.classList.remove('showColorBorder');
    }
    if (result && State.selectedImg.value && !State.selectedImg.value.classList.contains('showColorBorder')) {
      State.selectedImg.value.classList.add('showColorBorder');
    }
  },

  showCorrectEffect(status) {
    let result = document.querySelector('.gameWrapper .ansResult .wellDone');
    if (status) {
      switch (this.lang) {
        case "0":
          result.classList.add('engCorrect');
          break;
        case "1":
          result.classList.add('chCorrect');
          break;
        default:
          result.classList.add('engCorrect');
          break;
      }
      result.classList.add('show');
      result.addEventListener('animationend', () => result.classList.remove('show'));
    }
  },

  showWrongEffect(status) {
    let result = document.querySelector('.gameWrapper .ansResult .incorrect');
    if (status) {
      switch (this.lang) {
        case "0":
          result.classList.add('engWrong');
          break;
        case "1":
          result.classList.add('chWrong');
          break;
        default:
          result.classList.add('engWrong');
          break;
      }
      result.classList.add('show');
      result.addEventListener('animationend', () => result.classList.remove('show'));
    }
  },
  //-----------------------------------------------------------------------------------------------
  showRuleBox(status) {
    if (this.ruleBtn) {
      this.ruleBox.style.opacity = status ? 1 : 0;
      if (status) {
        this.ruleBtn.classList.remove('on');
        this.ruleBtn.classList.add('off');
      }
      else {
        this.ruleBtn.classList.add('on');
        this.ruleBtn.classList.remove('off');
      }
    }
  },
  //-----------------------------------------------------------------------------------------------
  setSelectCount(value) {
    for (let selectCount of this.selectCounts) selectCount.innerHTML = value;
  },
  //-----------------------------------------------------------------------------------------------
  setHeadTrackerMask(imgUrl = null) {
    if (imgUrl) {
      this.headTracker.src = imgUrl;
    }
  },
  showHeadTracker(status, width = null, left = null, top = null, rotation = 0) {
    if (width) this.headTracker.style.width = width;
    if (left) this.headTracker.style.left = left;
    if (top) this.headTracker.style.top = top;
    this.headTracker.style.transform = `rotate(${rotation}deg)`;
    this.headTracker.style.display = status ? 'block' : 'none';
  },

  playEatAnimated() {
    const duration = 1000;
    this.eatAnimated.style.opacity = 1;
    setTimeout(() => {
      this.eatAnimated.style.opacity = 0;
    }, duration);
  },

  setPlayerIcon(iconUrl = null) {
    if (iconUrl) {
      this.playerIcon.src = iconUrl;
    }
  },

  setPlayerName(name = null) {
    if (name && name !== '') {
      //this.playerName.style.display = 'block';
      //this.playerNameBox.style.opacity = 1;
      const textLength = name.length;
      const baseSize = this.playerName.getBoundingClientRect().width / textLength;
      this.playerNameText.textContent = name;
      if (baseSize > 10) {
        const containerWidth = (baseSize) - (textLength);
        this.playerNameText.style.fontSize = `${containerWidth}px`;
      }
    }
    else {
      //this.playerNameBox.style.opacity = 0;
      //this.playerName.style.display = 'none';
      this.playerNameText.textContent = '';
    }
  },

  setProgressBar(status = null) {
    this.progressBarWrapper.style.display = status ? 'block' : 'none';
  },

  setInstructionContent(content = null) {
    switch (this.lang) {
      case "0":
        this.instructionContent.classList.add('eng');
        break;
      case "1":
        this.instructionContent.classList.add('ch');
        break;
      default:
        this.instructionContent.classList.add('eng');
        break;
    }
    this.instructionContent.textContent = content;
  },

  setRuleHints(content = null) {
    switch (this.lang) {
      case "0":
        this.ruleHints.classList.add('eng');
        break;
      case "1":
        this.ruleHints.classList.add('ch');
        break;
      default:
        this.ruleHints.classList.add('eng');
        break;
    }
    this.ruleHints.textContent = content;
  },

  setRuleContent(content = null) {
    switch (this.lang) {
      case "0":
        this.rule.classList.add('eng');
        break;
      case "1":
        this.rule.classList.add('ch');
        break;
      default:
        this.rule.classList.add('eng');
        break;
    }
    this.rule.textContent = content;
  },

  setStartBtn() {
    switch (this.lang) {
      case "0":
        this.startBtn.classList.add('eng');
        break;
      case "1":
        this.startBtn.classList.add('ch');
        break;
      default:
        this.startBtn.classList.add('eng');
        break;
    }
  },

  setMusicOnOffWrapper() {
    switch (this.lang) {
      case "0":
        this.musicOnOffBoard.classList.add('eng');
        this.onBtn.classList.add('engOn');
        this.offBtn.classList.add('engOff');
        break;
      case "1":
        this.musicOnOffBoard.classList.add('ch');
        this.onBtn.classList.add('chOn');
        this.offBtn.classList.add('chOff');
        break;
      default:
        this.musicOnOffBoard.classList.add('eng');
        this.onBtn.classList.add('engOn');
        this.offBtn.classList.add('engOff');
        break;
    }
  },

  setGameTitle() {
    switch (this.lang) {
      case "0":
        this.gameTitle.innerText = "Stay To Eat";
        break;
      case "1":
        this.gameTitle.innerText = "留下來用餐";
        break;
      default:
        this.gameTitle.innerText = "Stay To Eat";
        break;
    }
  }
};
