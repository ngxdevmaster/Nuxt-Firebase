<template>
  <div class="content">

    <modal
      :show.sync="modals.form"
      body-classes="pt-4"
    >
      <card
        type="secondary"
        header-classes="bg-transparent"
        body-classes=""
        class="border-0 mb-0"
      >
        <template slot="header">
          <div class="text-center ">
            <h2>Add Field</h2>
          </div>
        </template>

        <base-input
          v-model="fieldInfo.name"
          alternative
          tag="div"
          class="mb-0"
          placeholder="Field Name"
          prepend-icon="ni ni-ui-04"
        >

        </base-input>
        <base-input
          v-model="slug"
          alternative
          tag="div"
          class="mb-0"
          placeholder="Slug"
          prepend-icon="ni ni-world-2"
        >
        </base-input>

        <div class="row">
          <div class="col-12">
            <card>
              <h5
                slot="header"
                class="h4 d-inline-block "
              >Field Values</h5>
              <div v-if="!bulkTriggered">

                <div
                  v-for="(item,i) in fieldInfo.values"
                  :key="item.id"
                  class="row"
                >
                  <div class="col-9">

                    <base-input
                      v-model="
                  fieldInfo.values[i].name"
                      alternative
                      class="mb-0"
                      placeholder="Enter Value"
                      prepend-icon="ni ni-bullet-list-67"
                    >
                    </base-input>
                  </div>
                  <div class="col-2">
                    <base-button
                      class="remove btn-link"
                      type="danger"
                      size="lg"
                      icon
                      @click.native="deleteFieldVal(i)"
                    >
                      <i class="text-white ni ni-fat-remove"></i>
                    </base-button>

                  </div>

                </div>

                <button
                  class="btn btn-sm btn-block btn-neutral"
                  @click="bulkTriggered = true"
                >
                  Add Bulk Values</button>
                <button
                  class="btn btn-sm btn-block btn-primary"
                  @click="addNewFieldVal"
                >Add Value</button>

              </div>
              <div v-else>
                <base-input label="Enter Bluk Values">
                  <textarea
                    id="bulkvalues"
                    v-model="bulkEntries"
                    class="form-control"
                    rows="3"
                    placeholder="enter return to add new values"
                  ></textarea>
                </base-input>
                <button
                  class="btn btn-sm btn-block btn-neutral"
                  @click="addBulkEntries"
                >Add Bulk Entries</button>
                <button
                  class="btn btn-sm btn-block btn-neutral"
                  @click="bulkTriggered = false"
                >Cancel</button>

              </div>

            </card>
          </div>

        </div>

        <button
          class="btn btn-primary btn-block "
          @click="addNewField"
        >Add</button>

      </card>

    </modal>

    <base-header class="pb-6">
      <div class="row align-items-center py-4">
        <div class="col-lg-6 col-7">
          <h6 class="h2 text-white d-inline-block mb-0">Mangage Fields</h6>
          <nav
            aria-label="breadcrumb"
            class="d-none d-md-inline-block ml-md-4"
          >
            <route-bread-crumb></route-bread-crumb>
          </nav>
        </div>
        <div class="col-lg-6 col-5 text-right">
          <base-button
            type="neutral"
            size="sm"
            @click.native="modals.form = true"
          >New</base-button>
          <base-button
            size="sm"
            type="neutral"
          >Filters</base-button>
        </div>
      </div>
    </base-header>
    <div class="container-fluid mt--6">
      <div>
        <card
          class="no-border-card"
          body-classes="px-0 pb-1"
          footer-classes="pb-2"
        >
          <template slot="header">
            <!-- <h3 class="mb-0">Paginated tables</h3> -->
            <p class="text-sm mb-0">
              This is where you will manage custom fields.
            </p>
          </template>
          <div>
            <div class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap">
              <el-select
                v-model="pagination.perPage"
                class="select-primary pagination-select"
                placeholder="Per page"
              >
                <el-option
                  v-for="item in pagination.perPageOptions"
                  :key="item"
                  class="select-primary"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>

              <div>
                <base-input
                  v-model="searchQuery"
                  prepend-icon="fas fa-search"
                  placeholder="Search..."
                >
                </base-input>
              </div>
            </div>
            <el-table
              :data="queriedData"
              row-key="id"
              header-row-class-name="thead-light"
              @sort-change="sortChange"
              @selection-change="selectionChange"
            >
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                v-bind="column"
              >
              </el-table-column>
              <el-table-column
                min-width="180px"
                align="right"
                label="Actions"
              >
                <div
                  slot-scope="{$index, row}"
                  class="d-flex"
                >

                  <base-button
                    class="edit"
                    type="primary"
                    size="sm"
                    icon
                    @click.native="handleEdit($index, row)"
                  >
                    <i class="text-white ni ni-ruler-pencil"></i>
                  </base-button>
                  <base-button
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                    @click.native="handleDelete($index, row)"
                  >
                    <i class="text-white ni ni-fat-remove"></i>
                  </base-button>
                </div>
              </el-table-column>
            </el-table>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category">
                Showing {{ from + 1 }} to {{ to }} of {{ total }} entries

                <span v-if="selectedRows.length">
                  &nbsp; &nbsp; {{selectedRows.length}} rows selected
                </span>
              </p>

            </div>
            <base-pagination
              v-model="pagination.currentPage"
              class="pagination-no-border"
              :per-page="pagination.perPage"
              :total="total"
            >
            </base-pagination>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import RouteBreadCrumb from "@/components/argon-core/Breadcrumb/RouteBreadcrumb";
import { BasePagination } from "@/components/argon-core";
import clientPaginationMixin from "~/components/tables/PaginatedTables/clientPaginationMixin";
import swal from "sweetalert2";

export default {
  components: {
    BasePagination,
    RouteBreadCrumb,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  mixins: [clientPaginationMixin],
  layout: "DashboardLayout",
  async asyncData(context) {
    try {
      /*       const snapshot = await context.app.$fireStore.collection('products').get()
       const collectionR = snapshot.docs.map(doc => doc)
      const collection = collectionR.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        }
      }) */

      const snapshot = await Promise.all([
        context.app.$fireStore.collection("inventoryValidation").get()
      ]);

      const collectionR = snapshot[0].docs.map(doc => doc);
      const fields = collectionR.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      });

      return { tableData: fields };
    } catch (error) {
      console.log(error);

      // context.error({
      //   statusCode: context.error.response.status,
      //   message: context.error.response.data
      // })
    }
  },

  data() {
    return {
      bulkTriggered: false,
      propsToSearch: ["id"],
      newId: 0,
      fieldTypes: ["single select", "multi select", "toggle"],
      bulkEntries: "",
      modals: {
        classic: false,
        notice: false,
        form: false
      },
      fieldInfo: {
        id: "",
        name: "",
        type: "",
        values: []
      },
      tableColumns: [
        {
          type: "selection"
        },
        {
          prop: "id",
          label: "Name",
          sortable: true
        }

        // {
        //   prop: "position",
        //   label: "Position",
        //   minWidth: 220,
        //   sortable: true
        // },
        // {
        //   prop: "city",
        //   label: "Office",
        //   minWidth: 135,
        //   sortable: true
        // },
        // {
        //   prop: "age",
        //   label: "Age",
        //   minWidth: 100,
        //   sortable: true
        // },
        // {
        //   prop: "createdAt",
        //   label: "Start Date",
        //   minWidth: 150,
        //   sortable: true
        // },
        // {
        //   prop: "salary",
        //   label: "Salary",
        //   minWidth: 120,
        //   sortable: true
        // }
      ],
      tableData: [],
      selectedRows: []
    };
  },
  computed: {
    slug: {
      // getter
      get() {
        return this.fieldInfo.id
          ? this.sluggit(this.fieldInfo.id)
          : this.sluggit(this.fieldInfo.name);
      },
      // setter
      set(newValue) {
        this.fieldInfo.id = newValue;
      }
    },
    bulkValues() {
      let ks = this.bulkEntries.split("\n");
      return ks.map((b, i) => {
        return { id: i, name: b };
      });
    }
  },
  methods: {
    addBulkEntries() {
      this.bulkTriggered = false;
      this.fieldInfo.values.push(...this.bulkValues);
      this.newId = this.fieldInfo.values.length;
    },
    addNewFieldVal() {
      // let nextValId = this.fieldInfo.values.length - 1;

      this.newId++;
      let obj = {
        id: this.newId,
        value: ""
      };
      this.fieldInfo.values.push(obj);
    },

    deleteFieldVal(id) {
      if (id >= 0) {
        this.fieldInfo.values.splice(id, 1);
      }
    },
    async addNewField() {
      try {
        this.fieldInfo.id = this.slug;
        const itemToAdd = this.$fireStore
          .collection("inventoryValidation")
          .doc(this.fieldInfo.id);
        await itemToAdd.set(this.fieldInfo);
      } catch (e) {
        console.log(e);
        return;
      }
      this.modals.form = false;
      this.tableData.push(this.fieldInfo);

      swal.fire({
        title: "Success!",
        text: `You added ${this.fieldInfo.id}`,
        type: "success",
        confirmButtonClass: "btn btn-success btn-fill",
        buttonsStyling: false
      });
    },

    handleLike(index, row) {
      swal.fire({
        title: `You liked ${row.id}`,
        buttonsStyling: false,
        type: "success",
        confirmButtonClass: "btn btn-success btn-fill"
      });
    },
    handleEdit(index, row) {
      this.$router.push(`/fields/${row.id}`);

      //   swal({
      //     title: `You want to edit ${row.name}`,
      //     buttonsStyling: false,
      //     confirmButtonClass: "btn btn-info btn-fill"
      //   });
    },
    handleDelete(index, row) {
      swal
        .fire({
          title: "Are you sure?",
          text: `You won't be able to revert this!`,
          type: "warning",
          showCancelButton: true,
          confirmButtonClass: "btn btn-success btn-fill",
          cancelButtonClass: "btn btn-danger btn-fill",
          confirmButtonText: "Yes, delete it!",
          buttonsStyling: false
        })
        .then(result => {
          if (result.value) {
            this.deleteRow(row);
            swal.fire({
              title: "Deleted!",
              text: `You deleted ${row.id}`,
              type: "success",
              confirmButtonClass: "btn btn-success btn-fill",
              buttonsStyling: false
            });
          }
        });
    },
    deleteRow(row) {
      let indexToDelete = this.tableData.findIndex(
        tableRow => tableRow.id === row.id
      );
      if (indexToDelete >= 0) {
        this.tableData.splice(indexToDelete, 1);
      }
      this.removeItem(row);
    },

    async removeItem(row) {
      try {
        const itemToRemove = this.$fireStore
          .collection("inventoryValidation")
          .doc(row.id);
        await itemToRemove.delete();
      } catch (e) {
        console.log(e);

        return;
      }
      console.log("Success.");
    },

    selectionChange(selectedRows) {
      this.selectedRows = selectedRows;
    }
  }
};
</script>
<style>
.no-border-card .card-footer {
  border-top: 0;
}
</style>
