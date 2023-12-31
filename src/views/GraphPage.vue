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
            <option>USD</option>
          </select>
        </h3>
        <input
          type="number"
          v-model.number="inputAmount"
          min="0"
          placeholder="Enter here"
          class="currency-input"
        />
        <h3 class="inner-column">
          To
          <select v-model="toCountry">
            <option disabled value="">Please select one</option>
            <option v-for="(item, key) in countryList" :key="key">{{ item }}</option>
          </select>
        </h3>

        <div class="blue-answer">{{ answer }}</div>
      </div>
      <h3 v-if="fromCountry !== '' && toCountry !== ''">
        From {{ countryDict[fromCountry] }} to {{ countryDict[toCountry] }}
        <h3>{{ ratesFrom[toCountry] }}</h3>
      </h3>
      <LineChart :chartData="testData" :options="options" />
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
    const inputAmount = ref()
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

    // Gets all historical data so that graph can read it
    const getData = async (currentRate: number) => {
      const temp: Number[] = []
      const tempMonth: String[] = []

      const now = new Date()
      //Get all previous dates and historical rate for each date
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
      // Get all countries on first render
      const result = await getCountries(token)

      if (!('error' in result)) {
        countryList.value = Object.keys(result)
        countryDict.value = result
      }
    })

    watchEffect(async () => {
      if (fromCountry.value !== '') {
        // Fetch the conversion data for base currency
        const result = await getLatestConversion(token, fromCountry.value)
        if (!('error' in result)) {
          ratesFrom.value = result.rates
        }
      }
    })

    watchEffect(() => {
      if (fromCountry.value !== '' && toCountry.value !== '') {
        // Get the current rates
        const rates = ratesFrom.value[toCountry.value]
        getData(rates)
        if (!isNaN(inputAmount.value)) {
          // Update answer value
          const tempAnswer = inputAmount.value * ratesFrom.value[toCountry.value]
          const roundedAnswer = Math.round((tempAnswer + Number.EPSILON) * 100) / 100
          answer.value = roundedAnswer
        }
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
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
}
select {
  max-height: 2rem;
  margin-top: 1rem;
}

.currency-input {
  max-height: 2rem;
  margin-top: 2rem;
}

.currency-input::placeholder {
  color: #4facfe;
}

.inner-column {
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
}
.inner-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 3rem;
}

.blue-answer {
  color: #4facfe;
  width: 4vw;
  font-size: 18px;
  padding-top: 2rem;
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
