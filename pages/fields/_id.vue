<template>
  <div>
    <base-header class="pb-6">
      <div class="row align-items-center py-4">
        <div class="col-lg-6 col-7">
          <h6 class="h2 text-white d-inline-block mb-0">
            Field Name: {{ name }}
          </h6>
          <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
            <route-breadcrumb />
          </nav>
        </div>
      </div>
      <!-- <global-events @keydown.control.enter="saveItem"></global-events> -->
    </base-header>

    <div class="container-fluid mt--6">
      <div class="row">
        <div class="col-lg-6">
          <div class="card-wrapper">
            <card>
              <div slot="header" class="row mb-0">
                <div class="col-12">
                  <div
                    class="d-flex align-items-center justify-content-between align-items-center"
                  >
                    <base-button size="md" type="primary" @click.native="add"
                      >Add</base-button
                    >
                  </div>
                </div>
              </div>
              <!-- Card body -->

              <draggable
                v-model="fieldValues"
                tag="div"
                class="list-group"
                handle=".handle"
                v-bind="dragOptions"
                @start="isDragging = true"
                @end="isDragging = false"
              >
                <transition-group type="transition" name="flip-list">
                  <div
                    v-for="(element, idx) in fieldValues"
                    :key="element.id"
                    class="p-0"
                  >
                    <div>
                      <div
                        class="d-flex align-items-center justify-content-between py-3"
                      >
                        <base-input
                          v-model="element.name"
                          tag="div"
                          class="w-100 draggable-input"
                          prepend-icon="fa fa-align-justify handle"
                          placeholder="Field Value"
                        ></base-input>

                        <button
                          type="button"
                          class="close pl-3"
                          data-dismiss="alert"
                          aria-label="Close"
                          @click="removeAt(idx)"
                        >
                          <span aria-hidden="true" class="fa fa-trash-alt">
                          </span>
                        </button>
                      </div>
                      <nested-dragger
                        v-if="element.types"
                        :title="`Types`"
                        :list="element.types"
                      />
                      <nested-dragger
                        v-if="element.models"
                        :title="`Models`"
                        :list="element.models"
                      />
                    </div>
                  </div>
                </transition-group>
              </draggable>
            </card>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card-wrapper">
            <card>
              <!--Card Header-->
              <h3 slot="header" class="mb-0">Name</h3>
              <!--Card Body-->

              <div class="w-100">
                <base-input
                  v-model="name"
                  tag="div"
                  class="w-100"
                  placeholder="Name"
                ></base-input>
              </div>
              <base-button size="md" type="primary" @click.native="saveItem"
                >Save</base-button
              >
            </card>

            <card>
              <!--Card Header-->
              <h3 slot="header" class="mb-0">Toggle buttons</h3>
              <!--Card Body-->
              <base-switch
                class="mr-1"
                on-text="On"
                off-text="Off"
              ></base-switch>
              <base-switch
                v-model="switches.primary"
                class="mr-1"
              ></base-switch>
              <base-switch
                v-model="switches.default"
                class="mr-1"
                type="default"
              ></base-switch>
              <base-switch
                v-model="switches.danger"
                class="mr-1"
                type="danger"
              ></base-switch>
              <base-switch
                v-model="switches.warning"
                class="mr-1"
                type="warning"
              ></base-switch>
              <base-switch
                v-model="switches.success"
                class="mr-1"
                type="success"
              ></base-switch>
              <base-switch
                v-model="switches.info"
                class="mr-1"
                type="info"
              ></base-switch>
            </card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { Select, Option } from 'element-ui'
import flatPicker from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import swal from 'sweetalert2'

import HtmlEditor from '@/components/argon-core/Inputs/HtmlEditor'
import TagsInput from '@/components/argon-core/Inputs/TagsInput'
import DropzoneFileUpload from '@/components/argon-core/Inputs/DropzoneFileUpload'
import BaseSlider from '@/components/argon-core/BaseSlider'

export default {
  name: 'FormComponents',
  layout: 'DashboardLayout',
  components: {
    HtmlEditor,
    TagsInput,
    DropzoneFileUpload,
    BaseSlider,
    flatPicker,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  async asyncData(context) {
    const profile = context.app.$fireStore
      .collection('inventoryValidation')
      .doc(context.params.id)

    try {
      const fieldData = await Promise.all([profile.get()])
      const fieldProf = fieldData[0]

      return {
        id: context.params.id,
        name: fieldProf.data().name,
        fieldValues: fieldProf.data().values,
      }
    } catch (error) {
      console.log(error)
    }
  },
  data() {
    return {
      name: '',
      latestId: 0,

      fieldValues: [],
      selectOptions: [
        {
          label: 'Alerts',
          value: 'Alerts',
        },
        {
          label: 'Badges',
          value: 'Badges',
        },
        {
          label: 'Buttons',
          value: 'Buttons',
        },
        {
          label: 'Cards',
          value: 'Cards',
        },
        {
          label: 'Forms',
          value: 'Forms',
        },
        {
          label: 'Modals',
          value: 'Modals',
        },
      ],
      selects: {
        simple: 'Badges',
        multiple: ['Alerts', 'Buttons'],
      },
      dates: {
        simple: new Date(),
        range: '2019-04-19 to 2019-04-24',
      },
      inputs: {
        tags: ['BUCHAREST', 'IASI', 'TIMISOARA'],
        fileSingle: [],
        fileMultiple: [],
      },
      switches: {
        off: false,
        primary: true,
        default: true,
        danger: true,
        warning: true,
        success: true,
        info: true,
      },
      sliders: {
        simple: 50,
        range: [200, 400],
      },
    }
  },
  computed: {
    maxId() {
      return this.fieldValues.length ? _.maxBy(this.fieldValues, 'id').id : 0
    },
    dragOptions() {
      return {
        animation: 0,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost',
      }
    },
  },
  methods: {
    async saveItem() {
      try {
        const itemTopdate = this.$fireStore
          .collection('inventoryValidation')
          .doc(this.id)

        const fieldData = {
          name: this.name,
          values: this.fieldValues,
        }

        await itemTopdate.update(fieldData)
      } catch (e) {
        console.log(e)
        return
      }

      swal.fire({
        title: 'Success!',
        text: `You updated ${this.id}`,
        type: 'success',
        confirmButtonClass: 'btn btn-success btn-fill',
        buttonsStyling: false,
      })
    },
    removeAt(idx) {
      this.fieldValues.splice(idx, 1)
    },
    add() {
      const cID = this.maxId + 1
      this.fieldValues.push({ id: cID, name: '', types: [], models: [] })
    },
  },
}
</script>

<style>
.handle {
  cursor: grabbing;
}
.draggable-input .form-group {
  margin-bottom: 0;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
</style>
