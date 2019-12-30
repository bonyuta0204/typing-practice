<template lang="pug">
div.columns.page
  div#typing-game.column.is-8.is-offset-2
    button(@click="startGame" tabindex=-1).button.is-info.is-size-4 start
    div#typing-area
      pre#typed-letters {{ typedLetter }}
      pre#next-letter {{ nextLetterDisplay }}
      pre#not-typed-letters {{ notTypedLetters }}
    p {{ elapsedTimeString }}
    p {{ missTypes }}
</template>

<script>

export default {
  data() {
    return {
      sentence: 'This is a long sentence used for typing game.\nThe sentence is useless just for practice\nveryveryuseless\nsouseless',
      charCount: 0,
      startTime: 0,
      elapsedTime: 0,
      isRunning: false,
      keyPressLogs: [],
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
    elapsedTimeString() {
      const dSecond = (`${this.elapsedTime}`)[0];
      return `${Math.floor(this.elapsedTime / 1000)}.${dSecond}`;
    },
    missTypes() {
      return this.keyPressLogs.filter((x) => !x.isCorrect).length;
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keydown, false);
  },
  methods: {
    keydown(e) {
      const ignoreKeys = ['Shift', 'Tab'];
      let targetKey = this.nextLetter;
      let typedKey = e.key;
      let isCorrect = false;
      if (!this.isRunning) { return; }

      if (ignoreKeys.includes(typedKey)) { return; }

      if (e.key === this.nextLetter) {
        this.charCount += 1;
        isCorrect = true;
      } else if (e.key === 'Enter' && this.nextLetter === '\n') {
        this.charCount += 1;
        isCorrect = true;
      }

      if (this.charCount === this.sentence.length) {
        this.endGame();
      }

      this.logKeyPress(targetKey = targetKey, typedKey = typedKey, isCorrect = isCorrect);
    },
    updateTimer() {
      setTimeout(() => {
        if (!this.isRunning) { return; }
        this.elapsedTime = new Date().getTime() - this.startTime;
        this.updateTimer();
      }, 100);
    },
    startGame() {
      this.isRunning = true;
      this.charCount = 0;
      this.startTime = new Date().getTime();
      this.elapsedTime = 0;
      this.updateTimer();
      document.activeElement.blur();
    },
    endGame() {
      this.isRunning = false;
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
  },
};

</script>

<style lang="scss">
.page { height: 0.8vw; }

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
