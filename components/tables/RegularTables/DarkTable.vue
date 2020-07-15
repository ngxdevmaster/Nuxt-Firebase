<template>
  <div class="card bg-default shadow">
    <div class="card-header bg-transparent border-0">
      <h3 v-if="tableHeader" class="mb-0 text-white">{{ tableHeader }}</h3>
    </div>

    <el-table
      class="table-responsive table-dark"
      header-row-class-name="thead-dark"
      :data="items"
    >
      <el-table-column label="Avatar" min-width="310px" prop="name" sortable>
        <template v-slot="{ row }">
          <div class="media align-items-center">
            <n-link
              :to="`/users/${row.id}`"
              class="avatar avatar-lg rounded-circle mr-3"
            >
              <img
                v-if="row.avatar && row.avatar.length && row.avatar[0]"
                :alt="row.fullName"
                :src="row.avatar[0].publicUrl"
              />
              <img v-else src="/favicon.png" alt="" />
            </n-link>
            <div class="media-body">
              <span class="font-weight-600 name mb-0 text-sm">{{
                row.fullName
              }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Email" prop="email" min-width="140px" sortable>
      </el-table-column>
      <el-table-column label="Date Created" min-width="170px" sortable>
        <template v-slot="{ row }">
          {{
            $moment(new Date(row.createdAt.seconds * 1000)).format(
              'MM/DD/YY h:mma'
            )
          }}
        </template>
      </el-table-column>
      <el-table-column label="Roles" min-width="170px" prop="status" sortable>
        <template v-slot="{ row }">
          <div v-for="(role, i) in row.roles" :key="i">
            {{ role }}
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="180px">
        <template>
          <el-dropdown trigger="click" class="dropdown">
            <span class="btn btn-sm btn-icon-only text-light">
              <i class="fas fa-ellipsis-v mt-2"></i>
            </span>
            <el-dropdown-menu
              slot="dropdown"
              class="dropdown-menu dropdown-menu-arrow show"
            >
              <a class="dropdown-item" href="#">Edit</a>
              <a class="dropdown-item" href="#">Remove</a>
            </el-dropdown-menu>
          </el-dropdown>
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
} from 'element-ui'
import projects from './../projects'
export default {
  name: 'LightTable',
  props: ['items', 'tableHeader'],
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Dropdown.name]: Dropdown,
    [DropdownItem.name]: DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
  },
  data() {
    return {
      projects,
      currentPage: 1,
    }
  },
}
</script>
