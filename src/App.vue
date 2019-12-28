<template lang="pug">
div#app
  p hogehoge fugafuga
  h1 hogehoge
  TypingGame
</template>

<script>

import TypingGame from './components/TypingGame.vue';

export default {
  components: {
    TypingGame,
  },
};

</script>

<style lang="scss">
#app {
  margin: 0 auto;
}

</style>
