<template lang="pug">
div.columns.page
  div#typing-game.column.is-8.is-offset-2
    button(@click="startGame" tabindex=-1).button.is-info.is-size-4 start
    button(@click="showCustomizeModal=true" tabindex=-1).button.is-info.is-size-4 customize
    button(@click="saveGameResult" tabindex=-1).button.is-info.is-size-4 save

    div#typing-area
      pre#typed-letters {{ typedLetter }}
      pre#next-letter {{ nextLetterDisplay }}
      pre#not-typed-letters {{ notTypedLetters }}
    p {{ (elapsedTime/1000).toFixed(1) }}
    p {{ missTypes }}
    div.modal#customize-modal(v-bind:class="{'is-active': showCustomizeModal}")
      div.modal-background(@click="hideCustomizeModal")
      div#customize-box.modal-content.box
        section
          p.title.has-text-centered Customize Typing sentence
        section
          div.field
            div.control
              textarea.textarea.is-primary(v-model="settingSentence")
        section.level.card-footer
          div.level-item
            button.button.is-primary(@click="saveTypingSentence") Save
      button.modal-close.is-large(@click="hideCustomizeModal")
    button.modal-close.is-large
    div.modal#result-modal(v-bind:class="{'is-active': showResultModal}")
      div.modal-background(@click="hideResultModal")
      div#result-box.modal-content.box
        section
          p.title.has-text-centered Your Result
        section#result-info
          p.stats Time:
          p.value {{ (elapsedTime/1000).toFixed(1) }} sec
          p
          | WPM: {{ wpm.toFixed(1) }}</br>
          | Keys per second: {{ keyPerSecond.toFixed(1) }} keys/s</br>
          | Miss Typed Keys: {{ missTypes }} keys</br>
          | Accuracy: {{ accuracy.toFixed(1) }} %</br>
        section.level.card-footer
          div.level-item
            button.button.is-primary(@click="startGame") Retry
      button.modal-close.is-large(@click="hideResultModal")
    button.modal-close.is-large
</template>

<script>
import { saveObject, loadObject } from '../../lib/LocalStorageUtils';

export default {
  data() {
    return {
      sentence: 'This is a long sentence used for typing game.\nThe sentence is useless just for practice\nveryveryuseless\nsouseless',
      settingSentence: '',
      charCount: 0,
      startTime: 0,
      elapsedTime: 0,
      isRunning: false,
      showResultModal: false,
      showCustomizeModal: false,
      keyPressLogs: [],
      lastResult: {},
    };
  },
  computed: {
    typedLetter() {
      return this.sentence.slice(0, this.charCount);
    },
    nextLetter() {
      return this.sentence[this.charCount];
    },
    nextLetterDisplay() {
      const nextLetter = this.sentence[this.charCount];
      if (nextLetter === '\n') {
        return '⏎\n';
      }
      return nextLetter;
    },
    notTypedLetters() {
      return this.sentence.slice(this.charCount + 1, this.charCount.length);
    },
    missTypes() {
      return this.keyPressLogs.filter((x) => !x.isCorrect).length;
    },
    keyPerSecond() {
      return (this.typedLetter.length / this.elapsedTime) * 1000;
    },
    wpm() {
      // 1 word is calculated as 5 charcters in wpm
      return (this.typedLetter.length * 60) / ((this.elapsedTime / 1000) * 5);
    },
    accuracy() {
      return (((this.typedLetter.length - this.missTypes) / this.typedLetter.length) * 100);
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keydown, false);
  },
  methods: {
    /**
     * ゲーム中にキーボードが押された時の処理を行う
    */
    keydown(e) {
      const ignoreKeys = ['Shift', 'Tab'];
      let targetKey = this.nextLetter;
      if (targetKey === '\n') {
        targetKey = 'Enter';
      }

      let typedKey = e.key;
      let isCorrect = false;

      if (!this.isRunning) { return; }

      if (ignoreKeys.includes(typedKey)) { return; }

      if (typedKey === targetKey) {
        this.charCount += 1;
        isCorrect = true;
      }

      if (this.charCount === this.sentence.length) {
        this.endGame();
      }

      this.logKeyPress(targetKey = targetKey, typedKey = typedKey, isCorrect = isCorrect);
    },
    /**
    * ゲーム中の経過時間測定を行う
    */
    updateTimer() {
      setTimeout(() => {
        if (!this.isRunning) { return; }
        this.elapsedTime = new Date().getTime() - this.startTime;
        this.updateTimer();
      }, 100);
    },
    startGame() {
      this.hideResultModal();
      this.isRunning = true;
      this.charCount = 0;
      this.startTime = new Date().getTime();
      this.elapsedTime = 0;
      this.updateTimer();
      document.activeElement.blur();
    },
    endGame() {
      this.isRunning = false;
      this.showResultModal = true;
      this.lastResult = this.analyzeGameResult();
      this.saveGameResult();
    },
    logKeyPress(targetKey, typedKey, isCorrect, elapsedTime, targetWord) {
      this.keyPressLogs.push({
        targetKey,
        typedKey,
        isCorrect,
        elapsedTime,
        targetWord,
      });
    },
    /**
     * ゲーム結果の分析を行い、分析結果を返す
    @return {object} 分析結果が格納されたオブジェクト
     */
    analyzeGameResult() {
      const gameResult = {};

      /**
       * @type {object} 正しく打てなかったキーをキー毎に数えた統計
      */
      const missTypeStats = {};

      this.keyPressLogs.filter((x) => !x.isCorrect).forEach((logEntry) => {
        const missedKey = logEntry.targetKey;
        if (missedKey in missTypeStats) {
          missTypeStats[missedKey] += 1;
        } else {
          missTypeStats[missedKey] = 1;
        }
      });
      gameResult.missTypeStats = missTypeStats;
      gameResult.keyPerSecond = this.keyPerSecond;
      gameResult.wpm = this.wpm;
      return gameResult;
    },
    /**
     * タイピングに使う文章の保存を行う
     */
    saveTypingSentence() {
      this.sentence = this.settingSentence;
      this.hideCustomizeModal();
    },
    /**
    * ゲームの結果をローカルストレージに保存
    */
    saveGameResult() {
      const keyName = 'typingGameResults';
      let gameHistories = loadObject(keyName);
      const historyRecord = { ...this.analyzeGameResult() };
      historyRecord.savedTime = new Date().getTime();
      if (gameHistories === null) {
        gameHistories = [];
      }
      gameHistories.push(historyRecord);
      saveObject(keyName, gameHistories);
    },
    hideResultModal() {
      this.showResultModal = false;
    },
    hideCustomizeModal() {
      this.showCustomizeModal = false;
    },
  },
};

</script>

<style lang="scss">
.page { height: 0.8vw; }

.box {
  display: flex;
  flex-direction: column;
}

.modal-content {
  min-height: 50vh;
}

textarea {
  padding: 40px;
  margin: 1rem 0;
}

.textarea:not([rows]) {
  min-height: 12em;
}

.card-footer {
  bottom: 0;
  margin-top: auto;
}

#result-info {
  margin: auto 30;
  line-height: 2.5rem;
}

.button {
  margin: 20 10;
}

#result-box {
  .stats {
    display: inline;
  }
}

#typing-game {
  margin: 30 auto;
  font-size: 1.5rem;

  button {
    user-select: none;
  }

  #typing-area {
    pre {
      background-color: transparent;
      padding: 0;
    }

    #typed-letters {
      color: black;
      display: inline;
    }

    #next-letter {
      color: red;
      display: inline;
      background-color: yellow;
    }

    #not-typed-letters {
      color: gray;
      display: inline;
    }
  }
}

</style>
