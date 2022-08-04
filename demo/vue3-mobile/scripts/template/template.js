module.exports = {
  vueTemplate: componentName => {
    return `<template>
  <div class="${componentName}"></div>
</template>
<script>
export default {
  name: '${componentName}',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>
<style lang="less">
.${componentName} {
}
</style>
`
  }
}
