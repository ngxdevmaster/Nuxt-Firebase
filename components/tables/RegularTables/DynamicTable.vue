<template>
  <div class="card shadow table-wrapper--inventory">
    <div class="card-header bg-transparent">
      <!-- <h3 v-if="tableHeader" class="mb-0">{{ tableHeader }}</h3> -->
      <base-button size="md" type="primary" class="inventory-btn" @click="modals.form = true">Add Inventory</base-button>
    </div>
      <inventory-modal :show.sync="modals.form" body-classes="pt-4" />

    <el-table class="table-responsive table-theme--light table-container" @cell-click="rowSelected" :data="items">
      
      <el-table-column label="all" min-width="50px" class="text-align-center">
        <template v-slot="{ row }">
          <!-- <el-checkbox :checked="isSelected(row.id)"></el-checkbox> -->
          <input type="radio" :checked="isSelected(row.id)">
        </template>
      </el-table-column>

      <el-table-column label="Media" min-width="100px" class="text-align-center" >
        <template v-slot="{ row }">
          <div class="media align-items-center">
            <n-link v-if="row.images" :to="`/inventory/${row.id}`" class="media-truck">
              <img
                v-if="row.images && row.images[0]"
                :alt="row.year && row.year.name"
                :src="row.images[0].publicUrl"
              />
              <img
                v-else
                src="@/assets/imgs/vt-image.png"
              />
            </n-link>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Published" min-width="70px" class="text-align-center">
        <template v-slot="{ row }">
          <div></div>
          <base-neon-switch
            v-model="row.on_website"
            class="mr-1"
            type="success"
            @input="update(row.on_website, row.id)"
          ></base-neon-switch>
        </template>
      </el-table-column>

      <el-table-column label="products" prop="last_8_vin" min-width="90px" class="text-align-center" sortable >
        <template v-slot="{ row }">
          <div class="align-items-center">
            <el-input size="small" @input.native="update" v-if="row.type && row.type.name" v-model="row.last_8_vin" class="cell"></el-input>
            <el-input size="small" @input.native="update" v-else placeholder="__" class="cell"></el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="category" min-width="90px" prop="type_sort" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" @input.native="update" v-if="row.type && row.type.name" v-model="row.type_sort" class="cell"></el-input>
            <el-input size="small" @input.native="update" v-else placeholder="__" class="cell"></el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Year" min-width="70px" prop="year_sort" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" @input.native="update" v-if="row.year && row.year.name" v-model="row.year_sort" class="cell"></el-input>
            <el-input size="small" @input.native="update" v-else placeholder="__" class="cell"></el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Make" min-width="150px" prop="make_sort" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" @input.native="update" v-if="row.make && row.make.name" v-model="row.make.name" class="cell double-input"></el-input>
            <el-input size="small" @input.native="update" v-if="row.model && row.model.name" v-model="row.model.name" class="cell double-input"></el-input>
            <div v-else>
              <el-input size="small" @input.native="update" placeholder="__" class="cell double-input"></el-input>
              <el-input size="small" @input.native="update" placeholder="__" class="cell double-input"></el-input>
            </div>
            <!-- <div class="cell">{{ row.make && row.make.name }} {{ row.model && row.model.name }}</div> -->
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Engine" min-width="150px" prop="engine_make_sort" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" v-if="row.engine_make && row.engine_make.name" v-model="row.engine_make.name" class="cell double-input"></el-input>
            <el-input size="small" v-if="row.engine_model && row.engine_model.name" v-model="row.engine_model.name" class="cell double-input"></el-input>
            <div v-else>
              <el-input size="small" placeholder="__" class="cell double-input"></el-input>
              <el-input size="small" placeholder="__" class="cell double-input"></el-input>
            </div>
            
          </div>
          
        </template>
      </el-table-column>

      <el-table-column label="Miles" min-width="80px" prop="miles" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" v-if="row.miles" v-model="row.miles"></el-input>
            <el-input size="small" v-else placeholder="__" class="cell"></el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Price" min-width="80px" prop="listing_price" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center input-form">
            <el-input size="small" v-if="row.listing_price" v-model="row.listing_price"></el-input>
            <el-input size="small" v-else placeholder="__" class="cell"></el-input>
            <!-- <div v-if="row.listing_price" class="cell">${{ row.listing_price | numFormat }}</div>
            <div v-else class="cell">__</div> -->
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Pob" min-width="80px" prop="current_location" class="text-align-center" sortable>
        <template v-slot="{ row }">
          <div class="align-items-center">
            <el-input size="small" v-if="row.current_location" v-model="row.current_location" class="cell"></el-input>
            <el-input size="small" v-else placeholder="__" class="cell"></el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="60px" label="modify" prop="modify" class="text-align-center">
        <template v-slot="{ row }">
        <div class="d-flex align-item-center">
          <n-link :to="`/inventory/${row.id}`" class="edit btn-link" type="warning" size="md">
            <img src="@/assets/imgs/edit.png">
          </n-link>
          <n-link :to="`/inventory/${row.id}`" class="remove btn-link" type="danger" size="md">
            <img src="@/assets/imgs/delete.png">
          </n-link>
        </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import {
  Table,
  TableColumn,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Checkbox
} from 'element-ui'
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['items', 'tableHeader'],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Dropdown.name]: Dropdown,
    [DropdownItem.name]: DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
    [Checkbox.name]: Checkbox
  },
  data() {
    this.selected = this.selected || [];
    return {
      currentPage: 1,
      modals: {
        classic: false,
        notice: false,
        form: false,
      },
    }
  },
  methods: {
    async update(v, id) {
      try {
        const itemToAdd = this.$fireStore.collection('inventory').doc(id)
        console.log(itemToAdd);
        await itemToAdd.update({
          on_website: v,
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })
        console.log('up ' + id)
      } catch (e) {
        console.log(e)
      }
    },
    select() {
      this.selected = [];
      if (!this.selectAll) {
        for (let i in this.items) {
          this.selected.push(this.items[i]);
        }
      }
    },
    isSelected(id) {
      this.selected = this.selected || [];
      return this.selected.indexOf(id) !== -1;
    },
    rowSelected(row) {
      this.$router.push({
        name: 'inventory-detail-id',  
        path: '/inventory/detail/:id?', 
        component: 'inventory/detail/_id.vue', 
        params: {id: `${row.id}`}
      });
    }
  }
}
</script>
