<template>
  <div>
    <base-header class="pb-6">
      <div class="row align-items-center py-4">
        <div class="col-lg-6 col-7">
          <h6 class="h2 text-white d-inline-block mb-0">IAM</h6>
        </div>
        <div class="col-lg-6 col-5 text-right">
          <!-- <base-button
            size="sm"
            type="neutral"
          >Filters</base-button> -->
          <el-dropdown trigger="click" class="dropdown">
            <base-button size="sm" type="neutral">Create User</base-button>

            <el-dropdown-menu
              slot="dropdown"
              class="dropdown-menu dropdown-menu-dark show"
            >
              <div class="px-4 py-2">
                <validation-observer
                  v-slot="{ handleSubmit }"
                  ref="formValidator"
                >
                  <form
                    class="needs-validation"
                    @submit.prevent="handleSubmit(createUser)"
                  >
                    <div class="form-row">
                      <div class="col-md-12">
                        <base-input
                          v-model="model.email"
                          alternative
                          class="mb-3"
                          name="Email"
                          :rules="{ required: true, email: true }"
                          prepend-icon="ni ni-email-83"
                          placeholder="Email"
                        >
                        </base-input>
                      </div>

                      <div class="col-md-12">
                        <base-input
                          v-model="model.username"
                          alternative
                          class="mb-3"
                          name="Username"
                          :rules="{ required: true }"
                          placeholder="Username"
                          prepend-icon="ni ni-circle-08"
                          success-message="Looks good!"
                        >
                        </base-input>
                      </div>
                      <div class="col-md-12">
                        <base-input
                          v-model="model.password"
                          alternative
                          class="mb-3"
                          name="Password"
                          :rules="{ required: true, min: 6 }"
                          prepend-icon="ni ni-lock-circle-open"
                          type="password"
                          placeholder="Password"
                        >
                        </base-input>
                      </div>
                    </div>
                    <base-button type="primary" native-type="submit"
                      >Add User</base-button
                    >
                  </form>
                </validation-observer>
              </div>

              <!-- <a
                class="dropdown-item"
                href="#"
              >Action</a>
              <a
                class="dropdown-item"
                href="#"
              >Another action</a>
              <a
                class="dropdown-item"
                href="#"
              >Something else here</a> -->
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </base-header>
    <div class="container-fluid mt--6">
      <div class="row">
        <div class="col">
          <dark-table :items="users" :table-header="'Users'"></dark-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Table,
  TableColumn,
} from 'element-ui'
import projects from '~/components/tables/projects'
import DarkTable from '~/components/tables/RegularTables/DarkTable'

export default {
  layout: 'DashboardLayout',
  components: {
    DarkTable,
    [Dropdown.name]: Dropdown,
    [DropdownItem.name]: DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  mounted() {
    this.$refs.formValidator.validate()
  },
  data() {
    return {
      projects,
      users: [],
      validated: false,
      createdUser: {},
      model: {
        avatar: [],
        firstName: '',
        lastName: '',
        fullName: '',
        username: '',
        password: '',
        roles: [],
        email: '',
      },
    }
  },
  async asyncData(context) {
    try {
      const snapshot = await context.app.$fireStore.collection('users').get()
      return { users: snapshot.docs.map((doc) => doc.data()) }
    } catch (error) {
      console.log(error)

      // context.error({
      //   statusCode: context.error.response.status,
      //   message: context.error.response.data
      // })
    }
  },
  methods: {
    async createUser() {
      try {
        this.createdUser = await this.$fireAuth.createUserWithEmailAndPassword(
          this.model.email,
          this.model.password
        )
        this.addUsertoDB()
      } catch (e) {
        console.log(e)
      }
    },
    async addUsertoDB() {
      try {
        const userToAdd = this.$fireStore
          .collection('users')
          .doc(this.createdUser.user.uid)
        const addedUser = await userToAdd.set({
          ...this.model,
          createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })
        this.sendNotification(addedUser)
      } catch (error) {
        console.log(error)
      }
    },
    async sendNotification(newUser) {
      const actionCodeSettings = {
        url: `https://${process.env.authDomain}/?email=${this.model.email}`,
      }

      console.log(actionCodeSettings)
      try {
        await this.$fireAuth.newUser.sendEmailVerification(actionCodeSettings)
        console.log(`email sent to ${this.createdUser.user.email}`)

        setTimeout(async () => {
          await this.$fireAuth.signOut()
          console.info('signed out')
          window.location.reload(true)
        }, 3000)
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>
