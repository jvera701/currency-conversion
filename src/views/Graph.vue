<template>
  <div class="container">
    <h1>Currency converter</h1>
    <h2>
      Convert popular currencies from around the world with updated exchange rates using our
      calculator.
    </h2>
    <div v-if="countryList.length > 0" class="white-container">
      <div class="inner-container">
        <h3 class="inner-column">
          From
          <select v-model="fromCountry">
            <option disabled value="">Please select one</option>
            <option v-for="(item, key) in countryList" :key="key">{{ item }}</option>
          </select>
        </h3>
        <input type="number" v-model="inputAmount" min="0" placeholder="Enter here" />
        <h3 class="inner-column">
          To
          <select v-model="toCountry">
            <option disabled value="">Please select one</option>
            <option v-for="(item, key) in countryList" :key="key">{{ item }}</option>
          </select>
        </h3>

        <div>{{ answer }}</div>
      </div>
      <h3 v-if="fromCountry !== '' && toCountry !== ''" class="from-text">
        From {{ countryDict[fromCountry] }} to {{ countryDict[toCountry] }} {{ ratesData }}
      </h3>
    </div>
    <div v-else>Loading ...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { getCountries, getLatestConversion, getHistorical } from '../api/api'
import { useUserStore } from '../stores/user'
import { defineComponent } from 'vue'
import { DoughnutChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'

const store = useUserStore()
const fromCountry = ref('')
const toCountry = ref('')
const countryList = ref<String[]>([])
const countryDict = ref({})
const ratesFrom = ref({})
const inputAmount = ref()
const answer = ref(0)
const ratesData = ref<Number[]>([])
const token = store.token.token
const previousMonthAmount = 2

const getData = async (currentRate: number) => {
  console.log('HERE')
  const temp: Number[] = []
  for (let i = 1; i <= previousMonthAmount; i++) {
    const now = new Date()
    const prev1 = new Date(now.getFullYear(), now.getMonth() - i, 15)
    const dateString = prev1.toISOString().split('T')[0]
    const result = await getHistorical(token, dateString, fromCountry.value, toCountry.value)
    if (!('error' in result)) {
      i === 1 && temp.unshift(currentRate)
      temp.unshift(result.rates[toCountry.value])
    }
  }
  ratesData.value = temp
}

onMounted(async () => {
  const result = await getCountries(token)

  if (!('error' in result)) {
    countryList.value = Object.keys(result)
    countryDict.value = result
  }
})

watchEffect(async () => {
  if (fromCountry.value !== '') {
    const result = await getLatestConversion(token, fromCountry.value)
    if (!('error' in result)) {
      ratesFrom.value = result.rates
    }
  }
})

watchEffect(() => {
  if (fromCountry.value !== '' && toCountry.value !== '' && !isNaN(inputAmount.value)) {
    answer.value = inputAmount.value * ratesFrom.value[toCountry.value]
  }
})

watchEffect(() => {
  if (fromCountry.value !== '' && toCountry.value !== '') {
    const rates = ratesFrom.value[toCountry.value]
    getData(rates)
  }
})
</script>

<style scoped>
.container {
  background-color: var(--color-neutral-gray);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
}
select {
  margin-right: 2rem;
}

h1 {
  font-size: 72px;
  color: var(--color-text-gray);
  font-weight: 475;
}
h2 {
  font-size: 16px;
  color: var(--color-text);
  font-weight: 400;
}
.white-container {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 0px 10px var(--color-text);
  margin-top: 1rem;
  width: 80%;
  height: 70%;
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
}
select {
  max-height: 2rem;
  margin-top: 1rem;
}
input {
  max-height: 2rem;
  margin-top: 1rem;
}
.inner-column {
  display: flex;
  flex-direction: column;
}
.inner-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.from-text {
  padding-top: 3rem;
}

@media (max-width: 600px) {
  .white-container {
    flex-direction: column;
  }
}
</style>
