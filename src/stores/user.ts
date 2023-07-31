import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
  'userStore',
  () => {
    const token = ref('')
    function updateToken(tokenToSet: string) {
      token.value = tokenToSet
    }

    return { token, updateToken }
  },
  { persist: true }
)
