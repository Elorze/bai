<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center relative bg-mario-sky font-vt323" style="background-image: linear-gradient(to bottom, #6b8cff 0%, #6b8cff 80%, #945e28 80%, #945e28 100%);">
    
    <!-- Cloud Decoration -->
    <div class="absolute top-10 left-10 w-16 h-8 bg-white/80 hidden md:block pixel-cloud opacity-50"></div>
    <div class="absolute top-24 right-20 w-24 h-10 bg-white/80 hidden md:block pixel-cloud opacity-60"></div>

    <slot />
  </div>
</template>

<style scoped>
.pixel-cloud {
  clip-path: polygon(
    20% 0%, 80% 0%, 
    100% 20%, 100% 80%, 
    80% 100%, 20% 100%, 
    0% 80%, 0% 20%
  );
}
</style>
