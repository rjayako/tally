<template>
  <div class="w-full h-full p-4">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js';
import { onMounted, ref } from 'vue';

defineOptions({
  name: 'BarGraph'
});

Chart.register(...registerables);

const chartRef = ref<HTMLCanvasElement | null>(null);

// Sample data - you can replace this with your actual data
const data = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [{
    label: 'Monthly Data',
    data: [65, 59, 80, 81, 56],
    backgroundColor: [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)'
    ],
    borderColor: [
      'rgba(75, 192, 192, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)'
    ],
    borderWidth: 1
  }]
};

onMounted(() => {
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
});
</script> 
