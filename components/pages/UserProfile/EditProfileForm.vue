<template>
  <card>
    <div slot="header" class="row align-items-center">
      <div class="col-12">
        <h3 class="mb-0">Edit profile</h3>
      </div>
    </div>

    <form @submit.prevent="updateProfile">
      <h6 class="heading-small text-muted mb-4">User information</h6>

      <div class="row">
        <div class="col-lg-6">
          <base-input
            v-model="user.username"
            type="text"
            label="Username"
            placeholder="Username"
          >
          </base-input>
        </div>
        <div class="col-lg-6">
          <base-input
            v-model="user.email"
            type="email"
            label="Email address"
            placeholder="mike@email.com"
          >
          </base-input>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <base-input
            v-model="user.firstName"
            type="text"
            label="First Name"
            placeholder="First Name"
          >
          </base-input>
        </div>
        <div class="col-lg-6">
          <base-input
            v-model="user.lastName"
            type="text"
            label="Last Name"
            placeholder="Last Name"
          >
          </base-input>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <base-input
            v-model="user.phone"
            type="phone"
            label="Phone"
            placeholder="Phone"
          >
          </base-input>
        </div>
        <div class="col-lg-6">
          <base-input label="Roles">
            <el-select
              v-model="user.roles"
              multiple
              filterable
              placeholder="Roles"
            >
              <el-option
                v-for="option in userRoles"
                :key="option.name"
                :label="option.label"
                :value="option.name"
              >
              </el-option>
            </el-select>
          </base-input>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-2">
          <div class="form-group">
            <label class="form-control-label">Avatar</label>

            <fp-uploader
              class="cursor-pointer"
              label="Update Avatar"
              :collection="'users'"
              :loaded-files="user.avatar"
              :panel-style="'compact circle'"
              @change="updateFile"
            />
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary">Update Profile</button>
    </form>
  </card>
</template>
<script>
import { Select, Option } from 'element-ui'
import { mapState } from 'vuex'
import TagsInput from '@/components/argon-core/Inputs/TagsInput'

export default {
  components: {
    TagsInput,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  props: {
    userProfile: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      user: {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        roles: [],
        avatar: [],
      },
    }
  },
  computed: {
    ...mapState(['userRoles']),
  },
  async mounted() {
    this.user = this.userProfile
  },

  methods: {
    updateFile(e) {
      console.log(e)
      this.user.avatar = [{ ...e }]
    },
    async updateProfile() {
      const profileRef = this.$fireStore.collection('users').doc(this.user.id)

      try {
        await profileRef.update({
          id: this.user.id,
          username: this.user.username,
          email: this.user.email,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          fullName: `${this.user.firstName} ${this.user.lastName}`,
          phone: this.user.phone,
          roles: this.user.roles,
          avatar: this.user.avatar,
        })
        const authUser = await this.$fireAuth.currentUser

        authUser
          .updateProfile({
            displayName: `${this.user.firstName} ${this.user.lastName}`,
            photoURL: this.user.avatar[0].publicUrl,
          })
          .then(() => {
            console.log('success')
          })
          .catch((error) => {
            console.log(error)
          })
      } catch (e) {
        console.log(e)

        this.notifyVue('danger')
        return
      }
      this.notifyVue('success')
    },
    notifyVue(type = 'default') {
      console.log(type)

      const messg =
        type === 'danger'
          ? 'There was an error updating your profile'
          : 'Your Profile Has Been Updated'
      this.$notify({
        message: messg,
        timeout: 5000,
        icon: 'ni ni-bell-55',
        type,
      })
    },
  },
}
</script>
<style></style>
