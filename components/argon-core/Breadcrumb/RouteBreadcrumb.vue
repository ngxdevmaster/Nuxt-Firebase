<template>
  <client-only>
    <bread-crumb list-classes="breadcrumb-links breadcrumb-dark">
      <BreadCrumbItem>
        <nuxt-link to="/" aria-label="Home">
          <i class="fas fa-home"></i>
        </nuxt-link>
      </BreadCrumbItem>
      <BreadCrumbItem
        v-for="(route, index) in $route.matched.slice()"
        :key="route.name"
        :active="index === $route.matched.length - 1"
        style="display: inline-block;"
      >
        <nuxt-link
          v-if="index < $route.matched.length - 1"
          :to="{ name: route.name }"
        >
          {{ route.name }}
        </nuxt-link>
        <span v-else>{{ route.name }}</span>
      </BreadCrumbItem>
    </bread-crumb>
  </client-only>
</template>

<script>
import BreadCrumb from './Breadcrumb'
import BreadCrumbItem from './BreadcrumbItem'

export default {
  name: 'RouteBreadcrumb',
  components: {
    BreadCrumb,
    BreadCrumbItem,
  },
  methods: {
    getBreadName(route) {
      return route.name
    },
  },
}
</script>

<style scoped></style>
