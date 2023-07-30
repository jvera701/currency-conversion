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
        <input type="number" v-model.number="inputAmount" min="0" placeholder="Enter here" />
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
        From {{ countryDict[fromCountry] }} to {{ countryDict[toCountry] }}
        <LineChart :chartData="testData" :options="options" />
      </h3>
    </div>
    <div v-else>Loading ...</div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { getCountries, getLatestConversion, getHistorical } from '../api/api'
import { useUserStore } from '../stores/user'
import { defineComponent, computed } from 'vue'
import { LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
import type { AllCountriesData } from '../api/api'

Chart.register(...registerables)

export default defineComponent({
  components: { LineChart },
  setup() {
    const store = useUserStore()
    const fromCountry = ref('')
    const toCountry = ref('')
    const countryList = ref<String[]>([])
    const countryDict = ref<AllCountriesData>({})
    const ratesFrom = ref<AllCountriesData>({
      '1': 1
    })
    const inputAmount = ref(0)
    const answer = ref(0)
    const ratesData = ref<Number[]>([])
    const token = store.token
    const monthList = ref<String[]>([])
    const previousMonthAmount = 2
    const options = ref({
      plugins: {
        legend: {
          display: false
        }
      }
    })

    const getData = async (currentRate: number) => {
      const temp: Number[] = []
      const tempMonth: String[] = []

      const now = new Date()
      for (let i = 1; i <= previousMonthAmount; i++) {
        const month = now.getMonth() - i
        const prev1 = new Date(now.getFullYear(), month, 15)
        const dateString = prev1.toISOString().split('T')[0]
        const result = await getHistorical(token, dateString, fromCountry.value, toCountry.value)
        if (!('error' in result)) {
          if (i === 1) {
            temp.unshift(currentRate)
            // Get current month and add it to the list
            tempMonth.unshift(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now))
          }
          temp.unshift(result.rates[toCountry.value])
          tempMonth.unshift(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(prev1))
        }
      }
      ratesData.value = temp
      monthList.value = tempMonth
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

    const testData = computed(() => ({
      labels: monthList.value,
      datasets: [
        {
          label: '',
          data: ratesData.value,
          borderColor: '#1751D0'
        }
      ]
    }))

    return {
      countryList,
      fromCountry,
      toCountry,
      countryDict,
      ratesFrom,
      inputAmount,
      answer,
      ratesData,
      testData,
      monthList,
      options
    }
  }
})
</script>

<style scoped>
.container {
  background-color: var(--color-neutral-gray);
  width: 100%;
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
  padding-left: 1rem;
  padding-right: 1rem;
}
h2 {
  font-size: 16px;
  color: var(--color-text);
  font-weight: 400;
  padding-left: 1rem;
  padding-right: 1rem;
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
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  margin-bottom: 2rem;
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
  .inner-container {
    flex-direction: column;
  }

  .white-container {
    height: 100%;
  }

  .container {
    height: 100%;
  }
}
</style>
