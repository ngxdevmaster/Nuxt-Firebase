<template>
  <div>
    <div
      class="header pb-6 d-flex align-items-center profile-header"
      :style="`background-image:url(${
        user.photoURL || '/img/theme/profile-cover.jpg'
      });`"
    >
      <!-- Mask -->
      <span class="mask bg-gradient-default opacity-8"></span>
      <!-- Header container -->
      <div class="container-fluid d-flex align-items-center">
        <div class="row">
          <div v-if="userProfile" class="col-lg-12">
            <h1 class="display-2 text-white inline">
              Hello {{ userProfile.firstName }}
            </h1>
            <p class="text-white mt-0 mb-5">
              <b>Last Login:</b> {{ user.lastlogin }} <br />
              <b> Last Created:</b> {{ user.created }} <br />
              <!-- Login Expires In: {{$moment(user.exp).format('LLLL')}} <br /> -->
            </p>
            <a
              v-if="!user.email_verified"
              href="#!"
              class="btn btn-neutral"
              @click.prevent="startVerification"
              >Verify Email</a
            >
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid mt--6">
      <div class="row">
        <div class="col-xl-12 order-xl-1">
          <edit-profile-form :user-profile="userProfile"></edit-profile-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import EditProfileForm from '~/components/pages/UserProfile/EditProfileForm.vue'
import UserCard from '~/components/pages/UserProfile/UserCard.vue'
import ProgressTrackList from '~/components/widgets/ProgressTrackList.vue'

import { mapState } from 'vuex'

export default {
  layout: 'DashboardLayout',
  components: {
    EditProfileForm,
    UserCard,
    ProgressTrackList,
  },
  data() {
    return {
      userProfile: {},
    }
  },
  async asyncData(context) {
    const profile = context.app.$fireStore
      .collection('users')
      .doc(context.params.id)

    try {
      let userData = await Promise.all([profile.get()])

      const userProf = userData[0]

      return { userProfile: userProf.data() }
    } catch (error) {
      console.log(error)

      // context.error({
      //   statusCode: context.error.response.status,
      //   message: context.error.response.data
      // })
    }
  },
  computed: {
    ...mapState(['user']),
  },
  methods: {
    async startVerification() {
      const authUser = await this.$fireAuth.currentUser

      // var actionCodeSettings = {
      //   url: 'https://www.example.com/?email=' + firebase.auth().currentUser.email,
      //   iOS: {
      //     bundleId: 'com.example.ios'
      //   },
      //   android: {
      //     packageName: 'com.example.android',
      //     installApp: true,
      //     minimumVersion: '12'
      //   },
      //   handleCodeInApp: true,
      //   // When multiple custom dynamic link domains are defined, specify which
      //   // one to use.
      //   dynamicLinkDomain: "example.page.link"
      // };

      console.log(process.env.authDomain)

      const actionCodeSettings = {
        url: `https://${process.env.authDomain}/?email=${authUser.email}`,
      }

      authUser
        .sendEmailVerification(actionCodeSettings)
        .then(() => {
          console.log('email sent ')
          this.notifyVue('success')

          window.location.reload(true)

          return
        })
        .catch((error) => {
          console.log(error)
          this.notifyVue('danger')
          return
        })
    },

    notifyVue(type = 'default') {
      console.log(type)

      const messg =
        type === 'danger' ? 'There was an error' : 'Email has been sent'
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
<style>
.profile-header {
  /* background-image: url(/img/theme/profile-cover.jpg); */
  background-size: cover;
  background-position: right -60vh;
  background-repeat: no-repeat;
  min-height: 385px;
}
</style>
