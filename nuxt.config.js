/*!

=========================================================
* Nuxt Argon Dashboard PRO - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nuxt-argon-dashboard-pro
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com and www.binarcode.com
* using node v12.16.0

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
require('dotenv').config()

// const pkg = require('./package')
console.log('ENV', process.env.NODE_ENV)
const fbconfig = process.env

module.exports = {
  mode: 'spa',

  router: {
    base: '/',
    middleware: 'auth',
    linkExactActiveClass: 'active',
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Express Trucks Dashboard',
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Revved Technologies LLC - Express Trucks Dashboard',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: 'favicon.png',
      },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700',
      },
      {
        rel: 'stylesheet',
        href: 'https://use.fontawesome.com/releases/v5.6.3/css/all.css',
        integrity:
          'sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/',
        crossorigin: 'anonymous',
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#fff',
  },

  /*
   ** Global CSS
   */
  css: ['assets/css/nucleo/css/nucleo.css', 'assets/sass/argon.scss'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/dashboard/dashboard-plugin',
    {
      src: '~/plugins/dashboard/full-calendar',
      ssr: false,
    },
    {
      src: '~/plugins/dashboard/world-map',
      ssr: false,
    },
    {
      src: '~/plugins/dashboard/filepond',
      ssr: false,
    },
    {
      src: '~/plugins/dashboard/formWizard',
    },
  ],

  /*
   ** Nuxt.js modules
   */
  buildModules: ['@nuxtjs/moment', '@nuxtjs/dotenv'],

  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    'nuxt-vue-multiselect',

    [
      'vue-currency-filter/nuxt',
      [
        {
          // default name 'currency'
          symbol: '$',
          thousandsSeparator: ',',
          fractionCount: 2,
          fractionSeparator: '',
          symbolPosition: 'front',
          symbolSpacing: true,
        },
        {
          // default name 'currency_2'
          name: 'currency_miles',
          symbol: '',
          thousandsSeparator: ',',
          fractionCount: '',
          fractionSeparator: '',
          symbolPosition: '',
          symbolSpacing: '',
        },
      ],
    ],
    [
      '@nuxtjs/firebase',
      {
        config: fbconfig,

        useOnly: [
          'firestore',
          'functions',
          'storage',
          'messaging',
          'analytics',
        ],

        services: {
          auth: {
            // Experimental Feature, use with caution.
            initialize: {
              onSuccessMutation: 'SET_AUTH_USER',
              onSuccessAction: 'loadRoles',
              onErrorMutation: null,
              onErrorAction: 'handleAuthError',
              ssr: false, // Default
            },
          },
          messaging: {
            createServiceWorker: false,
            onFirebaseHosting: false,
          },

          firestore: {
            // ...
            enablePersistence: {
              /**
               * Whether to synchronize the in-memory state of multiple tabs. Setting this
               * to 'true' in all open tabs enables shared access to local persistence,
               * shared execution of queries and latency-compensated local document updates
               * across all connected instances.
               *
               * To enable this mode, `synchronizeTabs:true` needs to be set globally in all
               * active tabs. If omitted or set to 'false', `enablePersistence()` will fail
               * in all but the first tab.
               */
              synchronizeTabs: true,
            },
          },
          storage: true,
          functions: true,
        },
      },
    ],
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
   ** Build configuration
   */
  build: {
    transpile: ['vee-validate/dist/rules'],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
    extractCSS: process.env.NODE_ENV === 'production',
    babel: {
      plugins: [
        [
          'component',
          {
            libraryName: 'element-ui',
            styleLibraryName: 'theme-chalk',
          },
        ],
      ],
    },
  },
}
