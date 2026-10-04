<template>
  <div class="columns page">
    <div id="typing-game" class="column is-8 is-offset-2">
      <button class="button is-info is-size-4" tabindex="-1" @click="startGame">start</button>
      <button class="button is-info is-size-4" tabindex="-1" @click="openCustomizeModal">customize</button>
      <button class="button is-info is-size-4" tabindex="-1" @click="saveGameResult">save</button>

      <div id="typing-area"><pre id="typed-letters">{{ typedLetter }}</pre><pre id="next-letter">{{ nextLetterDisplay }}</pre><pre id="not-typed-letters">{{ notTypedLetters }}</pre></div>
      <p>{{ (elapsedTime / 1000).toFixed(1) }}</p>
      <p>{{ missTypes }}</p>
      <div id="customize-modal" class="modal" :class="{ 'is-active': showCustomizeModal }">
        <div class="modal-background" @click="hideCustomizeModal" />
        <div id="customize-box" class="modal-content box">
          <section><p class="title has-text-centered">Customize Typing sentence</p></section>
          <section>
            <div class="field"><div class="control">
              <textarea v-model="settingSentence" class="textarea is-primary" aria-label="Typing sentence" />
            </div></div>
          </section>
          <section class="level card-footer"><div class="level-item">
            <button class="button is-primary" :disabled="!settingSentence.length" @click="saveTypingSentence">Save</button>
          </div></section>
        </div>
        <button class="modal-close is-large" aria-label="Close customize" @click="hideCustomizeModal" />
      </div>
      <div id="result-modal" class="modal" :class="{ 'is-active': showResultModal }">
        <div class="modal-background" @click="hideResultModal" />
        <div id="result-box" class="modal-content box">
          <section><p class="title has-text-centered">Your Result</p></section>
          <section id="result-info">
            <p>Time: {{ (elapsedTime / 1000).toFixed(1) }} sec</p>
            <p>WPM: {{ wpm.toFixed(1) }}</p>
            <p>Keys per second: {{ keyPerSecond.toFixed(1) }} keys/s</p>
            <p>Miss Typed Keys: {{ missTypes }} keys</p>
            <p>Accuracy: {{ accuracy.toFixed(1) }} %</p>
          </section>
          <section class="level card-footer"><div class="level-item">
            <button class="button is-primary" @click="startGame">Retry</button>
          </div></section>
        </div>
        <button class="modal-close is-large" aria-label="Close result" @click="hideResultModal" />
      </div>
    </div>
  </div>
</template>

<script>
import { saveObject, loadObject } from '../../lib/LocalStorageUtils.js';

export default {
  data() {
    return {
      sentence: 'This is a long sentence used for typing game.\nThe sentence is useless just for practice\nveryveryuseless\nsouseless',
      settingSentence: '',
      charCount: 0,
      startTime: 0,
      elapsedTime: 0,
      timerId: null,
      isRunning: false,
      showResultModal: false,
      showCustomizeModal: false,
      keyPressLogs: [],
      lastResult: {},
    };
  },
  computed: {
    typedLetter() { return this.sentence.slice(0, this.charCount); },
    nextLetter() { return this.sentence[this.charCount]; },
    nextLetterDisplay() { return this.nextLetter === '\n' ? '⏎\n' : this.nextLetter; },
    notTypedLetters() { return this.sentence.slice(this.charCount + 1); },
    missTypes() { return this.keyPressLogs.filter((entry) => !entry.isCorrect).length; },
    keyPerSecond() { return this.elapsedTime > 0 ? this.charCount / this.elapsedTime * 1000 : 0; },
    wpm() { return this.keyPerSecond * 60 / 5; },
    accuracy() { return this.keyPressLogs.length ? this.charCount / this.keyPressLogs.length * 100 : 0; },
  },
  mounted() { window.addEventListener('keydown', this.keydown); },
  beforeUnmount() {
    window.removeEventListener('keydown', this.keydown);
    this.stopTimer();
  },
  methods: {
    keydown(event) {
      if (!this.isRunning || this.showCustomizeModal || event.isComposing) return;
      if (event.metaKey || (event.ctrlKey && !event.getModifierState('AltGraph'))) return;
      if (['Shift', 'Tab', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      const targetKey = this.nextLetter === '\n' ? 'Enter' : this.nextLetter;
      const isCorrect = event.key === targetKey;
      if (isCorrect) this.charCount += 1;
      this.elapsedTime = Date.now() - this.startTime;
      this.keyPressLogs.push({ targetKey, typedKey: event.key, isCorrect, elapsedTime: this.elapsedTime });
      if (this.charCount === this.sentence.length) this.endGame();
    },
    stopTimer() {
      clearTimeout(this.timerId);
      this.timerId = null;
    },
    updateTimer() {
      this.timerId = setTimeout(() => {
        if (!this.isRunning) return;
        this.elapsedTime = Date.now() - this.startTime;
        this.updateTimer();
      }, 100);
    },
    startGame() {
      this.stopTimer();
      this.hideResultModal();
      this.hideCustomizeModal();
      this.charCount = 0;
      this.keyPressLogs = [];
      this.lastResult = {};
      this.startTime = Date.now();
      this.elapsedTime = 0;
      this.isRunning = this.sentence.length > 0;
      if (this.isRunning) this.updateTimer();
      document.activeElement?.blur();
    },
    endGame() {
      this.isRunning = false;
      this.stopTimer();
      this.showResultModal = true;
      this.lastResult = this.analyzeGameResult();
      this.saveGameResult();
    },
    analyzeGameResult() {
      const missTypeStats = {};
      this.keyPressLogs.filter((entry) => !entry.isCorrect).forEach(({ targetKey }) => {
        missTypeStats[targetKey] = (missTypeStats[targetKey] || 0) + 1;
      });
      return { missTypeStats, keyPerSecond: this.keyPerSecond, wpm: this.wpm };
    },
    openCustomizeModal() {
      this.isRunning = false;
      this.stopTimer();
      this.settingSentence = this.sentence;
      this.showCustomizeModal = true;
    },
    saveTypingSentence() {
      if (!this.settingSentence.length) return;
      this.sentence = this.settingSentence;
      this.charCount = 0;
      this.keyPressLogs = [];
      this.elapsedTime = 0;
      this.hideCustomizeModal();
    },
    saveGameResult() {
      const keyName = 'typingGameResults';
      const stored = loadObject(keyName);
      const gameHistories = Array.isArray(stored) ? stored : [];
      gameHistories.push({ ...this.analyzeGameResult(), savedTime: Date.now() });
      saveObject(keyName, gameHistories);
    },
    hideResultModal() { this.showResultModal = false; },
    hideCustomizeModal() { this.showCustomizeModal = false; },
  },
};
</script>

<style>
.page { min-height: 80vh; }
.box { display: flex; flex-direction: column; }
.modal-content { min-height: 50vh; }
textarea { padding: 40px; margin: 1rem 0; }
.textarea:not([rows]) { min-height: 12em; }
.card-footer { bottom: 0; margin-top: auto; }
#result-info { margin: auto 30px; line-height: 2.5rem; }
.button { margin: 20px 10px; }
#typing-game { margin: 30px auto; font-size: 1.5rem; }
#typing-game button { user-select: none; }
#typing-area { white-space: pre-wrap; overflow-wrap: anywhere; }
#typing-area pre { background-color: transparent; padding: 0; display: inline; white-space: pre-wrap; }
#typed-letters { color: black; }
#next-letter { color: red; background-color: yellow !important; }
#not-typed-letters { color: gray; }
</style>
