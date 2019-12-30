<template lang="pug">
div#app
  nav.navbar.is-primary
    div.navbar-brand
      h1.title.has-text-white Typing Game
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
