import View from './view';
import Sound from './sound';
import Game from './StayToEat';
import { apiManager } from "./apiManager";
import { logController } from './logController';

export default {
  apiManager: apiManager,
  state: 'load', //load/instruction/prepare/count/play
  lastState: '',
  stateLastAt: +new Date(),
  stateLastFor: 0,
  stateType: '',
  isSoundOn: true,
  isPlayingAudio: false,
  lang: null,
  gameTime: null,
  fallSpeed: null,
  engFontSize: null,
  gamePauseData: {
    state: '',
    stateType: '',
  },
  bodyInsideRedBox: {
    value: false,
    lastAt: +new Date(),
    lastFor: 0
  },
  selectedImg: {
    value: '',
    lastAt: +new Date(),
    lastFor: 0
  },
  setPoseState(stateName, newValue) {
    let state = this[stateName];
    if (state.value == newValue) {
      state.lastFor = +new Date() - state.lastAt;
    } else {
      state.value = newValue;
      state.lastAt = +new Date();
      state.lastFor = 0;
    }
  },
  //-----------------------------------------------------------------------------------------------
  getStateLastFor() {
    this.stateLastFor = +new Date() - this.stateLastAt;
    return this.stateLastFor;
  },
  //-----------------------------------------------------------------------------------------------
  changeState(state, stateType = '') {
    if (this.state === 'finished')
      return;

    logController.log(state, stateType, this.lastState);
    if (this.state == state) {
      this.stateLastFor = +new Date() - this.stateLastAt;
      if (this.stateType == stateType) return;
    } else {
      this.lastState = this.state;
      this.state = state;
      this.stateLastAt = +new Date();
      this.stateLastFor = 0;
    }
    this.stateType = stateType;

    if (state == 'instruction') {
      Game.init(this.lang, this.gameTime, this.fallSpeed, this.engFontSize);
      View.setProgressBar(false);
      View.hideTopLeftControl();
      View.hideTips();
      View.showCanvas();
      //View.hideCanvas();
      View.hideGame();
      View.hideFinished();
      View.showInstruction();
      Sound.stopAll();
      if (this.isSoundOn) {
        Sound.play('bgm', true);
        Sound.stopAll('bgm');
        //Sound.play('instruction');
      }
    } else if (state == 'prepare') {
      Game.init(this.lang, this.gameTime, this.fallSpeed, this.engFontSize);
      View.showRuleBox(false);
      View.hideFinished();
      View.showCanvas();
      View.hideInstruction();
      View.showGame();
      View.showPrepareBoard();
      Sound.stopAll('bgm');
      if (this.isSoundOn) Sound.play('prepare');
    } else if (state == 'counting3') {
      View.hidePrepareBoard();
      View.showCount(3);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 250);
    } else if (state == 'counting2') {
      View.showCount(2);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 250);
    } else if (state == 'counting1') {
      View.showCount(1);
      if (this.isSoundOn) setTimeout(() => Sound.play('countDown'), 250);
    } else if (state == 'counting0') {
      View.showCount(0);
      if (this.isSoundOn) {
        Sound.stopAll('bgm');
        setTimeout(() => Sound.play('start'), 250);
      }
    } else if (state == 'playing') {
      //View.showTips('tipsReady');
      View.setProgressBar(apiManager.isLogined ? true : false);
      View.showTopLeftControl();
      switch (stateType) {
        case 'showStage':
          setTimeout(() => this.changeState('playing', 'showQstImg'), 1000);
          break;
        case 'showQstImg':
          this.changeState('playing', 'waitAns');
          break;
        case 'checkingQuestion':
          break;
        case 'waitAns':
          View.hidePrepareBoard();
          Game.startCountTime();
          break;
        case 'ansWrong':
          if (this.isSoundOn) {
            Sound.stopAll(['bgm', 'lastTen']);
            Sound.play('ansWrong');
          }
          setTimeout(() => {
            this.setPoseState('selectedImg', '');
            if (state === 'playing')
              Game.moveToNextQuestion();
          }, 1000);
          break;
        case 'ansCorrect':
          if (this.isSoundOn) {
            Sound.stopAll(['bgm', 'lastTen']);
            Sound.play('ansCorrect');
          }
          setTimeout(() => {
            this.setPoseState('selectedImg', '');
            if (state === 'playing')
              if (this.apiManager.isLogined) {
                Game.moveToNextQuestion();
              }
              else {
                if (this.lang === "0" || !this.lang) {
                  Game.moveToNextQuestion();
                } else {
                  Game.clearOption();
                }
              }
          }, 1000);
          break;
      }

    } else if (state == 'showMusicOnOff') {
      Sound.stopAll(['bgm', 'lastTen']);
      View.hidePrepareBoard();
      View.showMusicOnOff();
    }
    else if (state == 'pause') {
      Sound.stopAll(['bgm', 'lastTen']);
      View.hidePrepareBoard();
      View.showExit();
    } else if (state == 'outBox') {
      if (stateType == 'outBox') {
        if (this.isSoundOn) Sound.play('outBox');
        //View.showTips('tipsOutBox');
        View.showPrepareBoard();
        Game.selectedCount = 0;
      }
    } else if (state == 'finished') {
      View.setProgressBar(false);
      View.showHeadTracker(false);
      View.hideTopLeftControl();
      View.hideTips();
      View.hideGame();
      View.showFinished();
      Sound.stopAll();
      if (this.isSoundOn) {
        Sound.stopAll('bgm');
        if (Game.score >= 30) {
          Sound.play('passGame');
          //logController.log("Play.........................p");
        }
        else {
          Sound.play('failGame');
          //logController.log("Play.........................f");
        }
      }
      Game.countUp(View.finishedScore, 0, Game.score, 2000, true, "", true, 'yellow', '#684f38');
      Game.showFinalStars();
      Game.stopCountTime();
      return;
    }
    else if (state == 'leave') {
      const hostname = window.location.hostname;
      let homePageUrl = '';

      if (hostname.includes('dev.openknowledge.hk')) {
        if (this.apiManager.isLogined) {
          this.apiManager.exitGameRecord(
            () => {
              this.roWebExit();
            }
          );
        }
        else {
          if (this.lang === "1" && this.lang) {
            location.reload();
            return;
          }
          if (window.self !== window.top) {
            logController.log("This page is inside an iframe");
            window.parent.postMessage("closeIframe", "*");
          }
          else {
            homePageUrl = window.location.origin + '/RainbowOne/webapp/OKAGames/SelectGames/';
            window.location.replace(homePageUrl);
          }
        }
      }
      else if (hostname.includes('rainbowone.app')) {
        if (this.apiManager.isLogined) {
          this.apiManager.exitGameRecord(
            () => {
              this.roWebExit();
            }
          );
        }
        else {
          if (this.lang === "1" && this.lang) {
            location.reload();
            return;
          }
          if (window.self !== window.top) {
            logController.log("This page is inside an iframe");
            window.parent.postMessage("closeIframe", "*");
          }
          else {
            homePageUrl = 'https://www.starwishparty.com';
            window.location.replace(homePageUrl);
          }
        }
      }
      else if (hostname.includes('localhost')) {
        location.reload();
      }
      else {
        logController.log("Quit Game");
        if (this.apiManager.isLogined) {
          this.apiManager.exitGameRecord(
            () => {
              location.hash = 'exit';
            }
          );
        }
        else {
          location.hash = 'exit';
        }
      }
    }

    if (state != 'playing') {
      View.showHeadTracker(false);
      Game.stopCountTime();
    }

  },

  roWebExit() {
    if (window.self !== window.top) {
      logController.log("This page is inside an iframe");
      window.parent.postMessage({ action: 'exit' }, "*");
    }
    else {
      logController.log("leave page, back to history");
      window.history.back();
    }
  },

  setSound(status) {
    if (!this.isSoundOn && status) {
      View.musicBtn.classList.add('on');
      View.musicBtn.classList.remove('off');
      Sound.play('bgm', true);
      if (Game.isPlayLastTen) {
        Sound.play('lastTen', true);
      }
      this.isSoundOn = status;
    }

    if (this.isSoundOn && !status) {
      View.musicBtn.classList.remove('on');
      View.musicBtn.classList.add('off');
      Sound.stopAll();
      this.isSoundOn = status;
    }
  }
  //-----------------------------------------------------------------------------------------------
};
