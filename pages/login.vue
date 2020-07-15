<template>
  <div>
    <!-- Header -->
    <div class="header  header-bg py-7 py-lg-8 pt-lg-9">
      <div class="container position-relative zindex-10">
        <div class="header-body text-center mb-5">
          <div class="row justify-content-center">
            <div class="col-xl-5 col-lg-6 col-md-8 px-5">
              <logo color="#fff" />
            </div>
          </div>
        </div>
      </div>
      <div class="separator  separator-bottom separator-skew zindex-2">
        <svg
          x="0"
          y="0"
          viewBox="0 0 2560 100"
          preserveAspectRatio="none"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            class="fill-default"
            points="2560 0 2560 100 0 100"
          ></polygon>
        </svg>
      </div>
    </div>
    <!-- Page content -->
    <div class="container position-relative zindex-10  mt--8 pb-5">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7">
          <div class="card bg-secondary border-0 mb-0">
            <!-- <div class="card-header bg-transparent pb-5">
              <div class="text-muted text-center mt-2 mb-3"><small>Sign in with</small></div>
              <div class="btn-wrapper text-center">
                <a href="#" class="btn btn-neutral btn-icon">
                  <span class="btn-inner--icon"><img src="~/static/img/icons/common/github.svg"></span>
                  <span class="btn-inner--text">Github</span>
                </a>
                <a href="#" class="btn btn-neutral btn-icon">
                  <span class="btn-inner--icon"><img src="~/static/img/icons/common/google.svg"></span>
                  <span class="btn-inner--text">Google</span>
                </a>
              </div>
            </div> -->
            <div class="card-body px-lg-5 py-lg-5">
              <!-- <div class="text-center text-muted mb-4">
                <small>Or sign in with credentials</small>
              </div> -->
              <validation-observer
                v-slot="{ handleSubmit }"
                ref="formValidator"
              >
                <form role="form" @submit.prevent="handleSubmit(onSubmit)">
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

                  <base-checkbox v-model="model.rememberMe"
                    >Remember me</base-checkbox
                  >
                  <div class="text-center">
                    <base-button
                      type="primary"
                      native-type="submit"
                      class="my-4"
                      >Sign in</base-button
                    >
                  </div>
                </form>
              </validation-observer>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-6">
              <a
                href="#password-reset"
                class="text-light"
                @click.prevent="passwordReset()"
                ><small>Forgot password?</small></a
              >
            </div>
            <!-- <div class="col-6 text-right">
              <router-link to="/register" class="text-light"
                ><small>Create new account</small></router-link
              >
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";

export default {
  layout: "AuthLayout",
  data() {
    return {
      model: {
        email: "",
        password: '""',
        rememberMe: false
      }
    };
  },
  methods: {
    ...mapActions(["handleAuthError"]),
    async passwordReset() {
       const actionCodeSettings = {
        url: `${process.env.databaseURL}/?email=${authUser.email}`
      };
      // this.$fireAuth
      //   .generatePasswordResetLink(this.model.email, actionCodeSettings)
      //   .then(link => {
      //     console.log(link);

      //     // Construct password reset email template, embed the link and send
      //     // using custom SMTP server.
      //     //return sendCustomPasswordResetEmail(email, displayName, link);
      //   })
      //   .catch(error => {
      //     console.log(error);

      //     // Some error occurred.
      //   });
    },
    async onSubmit() {
      try {
        let authenticationUser = null;
        let currentUser = null;
        const credentials = await this.$fireAuth.signInWithEmailAndPassword(
          this.model.email,
          this.model.password
        );

        if (credentials && credentials.user) {
          this.$router.push("/dashboard");
          //   authenticationUser = credentials.user;
          //   currentUser = await service.fetchMe();
          //   currentUser.emailVerified =
          //     authenticationUser.emailVerified;
        }
      } catch (e) {
        this.handleAuthError(e);
      }
    }
  }
};
</script>

<style>
.header-bg {
  background-image: url(~assets/imgs/efs_default_bg.jpeg);
  background-size: cover;
  background-position: center center;
  position: relative;
}

.header-bg::before {
  content: "";
  background: #172b4d;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  opacity: 0.8;
  width: 100%;
  height: 100%;
}
.zindex-2 {
  z-index: 2;
}
.zindex-10 {
  z-index: 10;
}
</style>
