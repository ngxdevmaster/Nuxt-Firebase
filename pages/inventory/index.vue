<template>
  <div class="page-inventory">
    <div class="pb-6">
      <div class="col-lg-12 align-items-center py-4">
        
        <div class="col-lg-6 col-7">
          <h1 class="h1 d-inline-block mb-0">Inventory/Products</h1>
          <!-- <button size="sm" class="btn btn-primary btn-sm" type="neutral" @click="modals.form = true">Add Inventory</button> -->
        </div>

      </div>
    </div>
    <div class="container-fluid mt--6">
      <inventory-modal :show.sync="modals.form" body-classes="pt-4" />

      <div class="row">
        <div class="col">
          <dynamic-table :items="inventory" :table-header="'Trucks'"></dynamic-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import _ from 'lodash'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Table,
  TableColumn,
  Select,
  Option,
  Form,
  FormItem
} from 'element-ui'

import projects from '~/components/tables/projects'

// import Modal from '~/components/argon-core/Modal'

export default {
  layout: 'DashboardLayout',
  components: {
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Select.name]: Select,
    [Option.name]: Option,
    [Dropdown.name]: Dropdown,
    [DropdownItem.name]: DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },

  async asyncData(context) {
    try {
      const snapshot = await Promise.all([
        context.app.$fireStore.collection('inventory').get(),
      ])

      const c = snapshot[0].docs.map((doc) => doc)

      const inv = c.map((doc) => {
        const dumpObj = {
          id: doc.id
        }

        const docData = doc.data();
        Object.keys(docData).map((key) => {
          dumpObj[key] = docData[key];
          if (typeof docData[key] === 'object' && docData[key] && docData[key].name) {
            dumpObj[key + '_sort'] = docData[key].name;
          }
        })
        return dumpObj;
      })

      return { inventory: inv }
    } catch (error) {
      console.log(error)
    }
  },
  data() {
    return {
      projects,

      modals: {
        classic: false,
        notice: false,
        form: false,
      },
    }
  },
  computed: {},
  mounted() {},
  methods: {},
}
</script>
