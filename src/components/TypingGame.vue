<template lang="pug">
div#typing-game
  pre#typed-letters {{ typedLetter }}
  pre#next-letter {{ nextLetter }}
  pre#not-typed-letters {{ notTypedLetters }}

  p {{ message }}
</template>

<script>

export default {
  data() {
    return {
      sentence: 'This is a long sentence used for typing game.\nThe sentence is useless just for practice\nveryveryuseless\nsouseless',
      charCount: 12,
    };
  },
  computed: {
    typedLetter() {
      return this.sentence.slice(0, this.charCount);
    },
    nextLetter() {
      return this.sentence[this.charCount];
    },
    notTypedLetters() {
      return this.sentence.slice(this.charCount + 1, this.charCount.length);
    },
  },
};

</script>

<style lang="scss">
#typing-game {
  margin: 0 auto;
  font-size: 1.5rem;

  #typed-letters {
    color: black;
    display: inline;
  }

  #next-letter {
    color: red;
    display: inline;
  }

  #not-typed-letters {
    color: gray;
    display: inline;
  }
}

</stiyle>
