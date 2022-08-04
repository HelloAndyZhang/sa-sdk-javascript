<template>
  <div class="page-index">
    <button @click="tarck('add')">增加</button>
    <button @click="tarck('dec')">异步增加</button>
    <button @click="resetAppStore">重置</button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import uFox from '../../../../lib/index.esm'
const router = useRouter()
const route = useRoute()
const resetAppStore = () => {
  router.push({
    name: 'result',
    query: {
      ...route.query
    }
  })
}
const tarck =(type='')=>{
  uFox.track(type,{pageName:'uupt'})
}
</script>

<style lang="less" scoped></style>
