import slugify from 'slugify'
import draggable from 'vuedraggable'
import GlobalEvents from 'vue-global-events'
import { Input, Tooltip, Popover } from 'element-ui'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import Vue from 'vue'
import VueMask from 'v-mask'
import VueFormGenerator from 'vue-form-generator'
import Badge from '~/components/argon-core/Badge.vue'
import BaseAlert from '~/components/argon-core/BaseAlert'
import BaseButton from '~/components/argon-core/BaseButton.vue'
import BaseCheckbox from '~/components/argon-core/Inputs/BaseCheckbox.vue'
import BaseDropdown from '~/components/argon-core/BaseDropdown.vue'
import BaseHeader from '~/components/argon-core/BaseHeader'
import BaseInput from '~/components/argon-core/Inputs/BaseInput.vue'
import BaseNav from '~/components/argon-core/Navbar/BaseNav'
import BasePagination from '~/components/argon-core/BasePagination'
import BaseProgress from '~/components/argon-core/BaseProgress'
import BaseRadio from '~/components/argon-core/Inputs/BaseRadio'
import BaseSwitch from '~/components/argon-core/BaseSwitch.vue'
import BaseNeonSwitch from '~/components/argon-core/BaseNeonSwitch.vue'
import Card from '~/components/argon-core/Cards/Card.vue'
import Modal from '~/components/argon-core/Modal.vue'
import InventoryModal from '~/components/pages/forms/InventoryModal.vue'

import Logo from '~/components/argon-core/Navbar/Logo.vue'
import RouteBreadcrumb from '~/components/argon-core/Breadcrumb/RouteBreadcrumb'
import StatsCard from '~/components/argon-core/Cards/StatsCard.vue'

// Register my awesome field
import FieldMask from '~/components/pages/forms/FieldMask'

// numeral for format number
import numeral from 'numeral';
import numFormat from 'vue-filter-number-format';

Vue.use(VueMask)
Vue.component('FieldMask', FieldMask)

Vue.use(VueFormGenerator)

Vue.filter('numFormat', numFormat(numeral));

/**
 * You can register global components here and use them as a plugin in your main Vue instance
 */

Vue.component(Badge.name, Badge)
Vue.component(BaseAlert.name, BaseAlert)
Vue.component(BaseButton.name, BaseButton)
Vue.component(BaseCheckbox.name, BaseCheckbox)
Vue.component(BaseHeader.name, BaseHeader)
Vue.component(BaseInput.name, BaseInput)
Vue.component(BaseDropdown.name, BaseDropdown)
Vue.component(BaseNav.name, BaseNav)
Vue.component(BasePagination.name, BasePagination)
Vue.component(BaseProgress.name, BaseProgress)
Vue.component(BaseRadio.name, BaseRadio)
Vue.component(BaseSwitch.name, BaseSwitch)
Vue.component(BaseNeonSwitch.name, BaseNeonSwitch)
Vue.component(Card.name, Card)
Vue.component(Logo.name, Logo)
Vue.component(Modal.name, Modal)
Vue.component(InventoryModal.name, InventoryModal)

Vue.component(StatsCard.name, StatsCard)
Vue.component(RouteBreadcrumb.name, RouteBreadcrumb)

Vue.component(Input.name, Input)
Vue.component('dynamic-table', () =>
  import('@/components/tables/RegularTables/DynamicTable.vue')
)
Vue.component('fp-uploader', () =>
  import('@/components/argon-core/Inputs/FilePondUpload')
)

Vue.component('validation-provider', ValidationProvider)
Vue.component('validation-observer', ValidationObserver)
Vue.use(Tooltip)
Vue.use(Popover)

Vue.component('draggable', draggable)
Vue.component('nested-dragger', () =>
  import('@/components/argon-core/Collapse/NestedDragger')
)

Vue.component('GlobalEvents', GlobalEvents)

Vue.mixin({
  filters: {
    capitalize(value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    sluggit(value) {
      if (!value) return ''
      const s = slugify(value, {
        remove: /[*+~`.()/'"!:@]/g,
        replacement: '-', // replace spaces with replacement
        lower: true, // result in lower case
      })
      return s
    },
  },
  data() {
    return {
      toggled: false,
      alertInView: false,
      userModalToggled: false,
      editUserModalToggled: false,
      date: new Date(),
      testCount: new Date().getTime() + 6000,
    }
  },
  methods: {
    mapCollection(collection) {
      const c = collection.docs.map((doc) => doc)
      if (!collection.empty) return []
      const list = c.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      })
      return list
    },
    async getURLThumb(img) {
      const storageRef = this.$fireStorage.ref().child(img)
      try {
        const url = await storageRef.getDownloadURL()
        return url
      } catch (e) {
        return e
      }
    },
    fileType(filename) {
      return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined
    },
    sluggit(value) {
      if (!value) return ''
      const s = slugify(value, {
        remove: /[*+~`.()/'"!:@]/g,
        replacement: '-', // replace spaces with replacement
        lower: true, // result in lower case
      })
      return s
    },
    truncate(text, length, clamp, link) {
      text = text || ''
      clamp = clamp || '...'
      length = length || 30
      if (text.length <= length) return text

      let tcText = text.slice(0, length - clamp.length)
      let last = tcText.length - 1

      while (last > 0 && tcText[last] !== ' ' && tcText[last] !== clamp[0])
        last -= 1

      // Fix for case when text dont have any `space`
      last = last || length - clamp.length

      tcText = tcText.slice(0, last)
      return tcText + clamp
    },
    even(number) {
      return number % 2 === 0
    },
  },
})
