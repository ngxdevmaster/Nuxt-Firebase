<template>
  <input
    v-model="value"
    v-mask="'###,###,###'"
    class="form-control"
    type="text"
    :disabled="disabled"
    :maxlength="schema.max"
    :placeholder="schema.placeholder"
    :readonly="schema.readonly"
  />
</template>

<script>
import { abstractField } from 'vue-form-generator'

export default {
  mixins: [abstractField],
}
</script>
