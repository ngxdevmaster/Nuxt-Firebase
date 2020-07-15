<template>
  <div class="next-bg bg-secondary py-3 px-2">
    <div class="d-flex align-items-center justify-content-between pl-3 pb-2 w-100">
      <div class="w-100">
        <h3 class="h5 pt-2">{{title}} ({{realValue.length}}) </h3>
      </div>
      <base-button
        size="sm"
        type="primary"
        class="d-flex w-25"
        @click.native="add"
      >Add {{title}}</base-button>
      <base-button
        v-if="toggled"
        size="sm"
        type="neutral"
        @click.native="toggled = !toggled"
      > Close </base-button>
      <base-button
        v-else
        size="sm"
        class="d-flex w-25"
        type="neutral"
        @click.native="toggled = !toggled"
      >View All {{realValue.length}}</base-button>
    </div>

    <transition name="page">

      <draggable
        v-if="list && list.length && toggled"
        :value="value"
        :list="list"
        @input="emitter"
      >

        <transition-group
          type="transition"
          name="flip-list"
        >
          <div
            v-for="(type, t) in realValue"
            :key="type.id"
            class="d-flex align-items-center justify-content-between pb-2"
          >
            <base-input
              v-model="type.name"
              alternative
              tag="div"
              class="w-100 pl-2 draggable-input"
              prepend-icon="fa fa-align-justify handle"
              placeholder="Field Value"
            ></base-input>
            <button
              type="button"
              class="close pl-3"
              data-dismiss="alert"
              aria-label="Close"
              @click="removeAt(t)"
            >
              <span
                aria-hidden="true"
                class="fa fa-minus  "
              > </span>
            </button>
          </div>
        </transition-group>

      </draggable>
    </transition>

  </div>
</template>

<script>
import _ from "lodash";
export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    title: {
      required: false,
      type: String,
      default: ""
    },
    value: {
      required: false,
      type: Array,
      default: null
    },
    list: {
      required: false,
      type: Array,
      default() {
        return [];
      }
    }
  },

  data() {
    return {
      toggled: true
    };
  },
  computed: {
    maxId() {
      return this.realValue.length ? _.maxBy(this.realValue, "id").id : 0;
    },
    realValue() {
      return this.value ? this.value : this.list;
    }
  },
  methods: {
    emitter(value) {
      this.$emit("input", value);
    },
    removeAt(t) {
      this.realValue.splice(t, 1);
    },
    add: function() {
      let cID = this.maxId + 1;
      this.realValue.push({ id: cID, name: "" });
    }
  }
};
</script>

<style>
</style>