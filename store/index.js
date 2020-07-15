import { getField, updateField } from 'vuex-map-fields'

export const state = () => ({
  modalToggled: false,
  userRoles: [],
  dynofields: [],

  user: {
    id: '',
    email: '',
    email_verified: false,
    created: '',
    lastlogin: '',
    auth_time: '',
    exp: '',
    displayName: '',
    photoURL: '',
  },
})

export const mutations = {
  updateField,

  TOGGLE: (state, bool) => {
    state.modalToggled = bool
  },
  ON_ERROR_MUTATION: (state, error) => {
    // Hanlde an auth error in a mutation...
    console.log(`ERRRR ====== ${error}`)
  },
  SET_ROLES: (state, data) => {
    state.userRoles = data
  },
  SET_DYNO_FIELDS: (state, data) => {
    state.dynofields = data
  },

  mapCollection: (state, collection) => {
    if (collection.empty) return []
    const c = collection.map((doc) => doc)
    const list = c.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      }
    })
    // const list = [];  collection.forEach((document) => {
    //      const item = Object.assign({}, document.data(), {
    //        id: document.id,
    //      });

    //      // this.replaceAllTimestampToDate(item);
    //      list.push(item);
    //    });

    return list
  },

  SET_AUTH_USER: (state, { authUser, claims }) => {
    state.user.id = authUser.uid
    state.user.email = authUser.email
    state.user.email_verified = authUser.emailVerified
    state.user.created = authUser.metadata.creationTime
    state.user.lastlogin = authUser.metadata.lastSignInTime
    state.user.auth_time = claims.auth_time
    state.user.exp = claims.exp
    state.user.displayName = authUser.displayName
    state.user.photoURL = authUser.photoURL
  },
}

export const actions = {
  async loadRoles({ commit, state, app }, context) {
    try {
      const snapshot = await Promise.all([
        this.$fireStore.collection('roles').get(),
        this.$fireStore.collection('inventoryValidation').get(),
      ])

      commit(
        'SET_ROLES',
        snapshot[0].docs.map((doc) => doc.data())
      )
      const v = snapshot[1].docs.map((doc) => doc)

      const validations = v.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      })
      commit('SET_DYNO_FIELDS', validations)
    } catch (error) {
      console.log(error)
    }
  },

  handleAuthError: (ctx, error) => {
    console.log(error)
    // Hanlde an auth error in an action...
  },

  replaceAllTimestampToDate(arg) {
    if (!arg) {
      return arg
    }
    Object.keys(arg).forEach((key) => {
      if (arg[key] && arg[key] instanceof this.$fireStore.Timestamp) {
        arg[key] = arg[key].toDate()
      }
    })
  },
}

export const getters = {
  getField,
}
