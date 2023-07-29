<template>
  <div class="container">
    <form v-on:submit.prevent="loginPressed" class="left-container">
      <h1 class="title">Login to account</h1>
      <h2 class="subtitle">Enter your credentials to access your account</h2>
      <input placeholder="Enter the email" class="top-input" v-model="email" />
      <input placeholder="Enter password" type="password" v-model="password" />
      <button type="submit">Login</button>
      <h2 v-if="failed" class="failed">Wrong credentials, please try again</h2>
    </form>
    <img src="../assets/coin-image.png" class="coin" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../api/api'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
const store = useUserStore()

const email = ref('')
const password = ref('')
const failed = ref(false)
const router = useRouter()

const loginPressed = async () => {
  const result = await login(email.value, password.value)
  if ('error' in result) {
    failed.value = true
    await delay(3000)
    failed.value = false
  } else {
    store.updateToken(result)
    router.push('/graph')
  }
}
</script>

<style scoped>
.title {
  font-weight: 600;
  font-size: 32px;
  color: #0a090b;
}
.subtitle {
  font-weight: 400;
  font-size: 16px;
  color: #4f4d55;
}
.failed {
  font-weight: 600;
  font-size: 20px;
  color: red;
  padding-top: 2rem;
}
.left-container {
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
  align-items: center;
  justify-content: center;
  width: 50vw;
  height: 100vh;
}

.about {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  background-color: aqua;
}

input {
  margin-bottom: 2rem;
  width: 20rem;
  padding: 0.5rem;
  border-color: var(--color-neutral-gray);
  border-radius: 0.3rem;
}

.top-input {
  margin-top: 2rem;
}
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
}

img {
  width: 50vw;
  height: 100vh;
}

button {
  width: 20rem;
  align-items: center;
  padding: 0.5rem;
  color: white;
  border-radius: 0.3rem;
  border-color: transparent;
  background-color: var(--color-blue);
}

@media (max-width: 600px) {
  .coin {
    display: none;
  }
  .left-container {
    width: 100vw;
  }
}
</style>
