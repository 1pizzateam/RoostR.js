<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { startCanvas } from '../canvas.js';
import { drawLogo } from '../logo.js';

const canvas = ref(null);
let stop = null;

onMounted(() => {
  stop = startCanvas(canvas.value, drawLogo);
});

onBeforeUnmount(() => {
  stop?.();
});
</script>

<template>
  <canvas ref="canvas" class="roostr-logo" aria-label="RoostR.js 3D WebGL engine logo"></canvas>
</template>
