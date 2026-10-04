<template>
  <div>
    <nav class="navbar is-primary">
      <div class="navbar-brand">
        <h1 class="title has-text-white">Typing Game</h1>
      </div>
    </nav>
    <TypingGame />
  </div>
</template>

<script>
import TypingGame from './components/TypingGame.vue';

export default {
  components: { TypingGame },
};
</script>

<style>
#app {
  margin: 0 auto;
}
</style>
