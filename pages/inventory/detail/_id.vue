<template>
  <div class="page-inventory-details">
    <base-header class="pb-6">
      <div class="row align-items-center py-4">
        <div class="col-lg-6 col-7">
          <!-- <h6 class="h2 text-white d-inline-block mb-0">
            {{ snapshot.name }}
          </h6> -->
          <!-- <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
            <route-breadcrumb />
          </nav> -->
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--6">
      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="updateInventory">
            <div class="row">
              <div class="col-sm-6 col-md-5">
                <div class="form-group">
                  <fp-uploader
                    class="cursor-pointer"
                    label="Edit Images"
                    :allow-multiple="true"
                    :collection="'inventory'"
                    :loaded-files="inventory_images"
                    @newFile="newFile"
                    @deleted="deleteFile"
                    @orderFiles="updateFilesOrder"
                    @revertUpload="revertFileUpload"
                  />
                </div>
              </div>
              <div class="col-sm-6 col-md-7 "> 
                <template>
                  <el-tabs type="card" @tab-click="handleClick">
                    <el-tab-pane label="Primary Spec">
                      <div class="card-body">
                        <div class="col-lg-12 col-9">
                          <h1 class="h1 d-inline-block mb-0 text-align-left">
                            <b style="border-style:dotted;border-width:thin;padding:5px;">{{ snapshot.year.name }}</b> {{ snapshot.make.name}} | {{ snapshot.engine_model.name}} {{ snapshot.model.name }}
                          </h1>
                        </div>
                      </div>
                      <vue-form-generator
                        :schema="primaryInfo"
                        :model="snapshot"
                        :options="formOptions"
                      ></vue-form-generator>
                    </el-tab-pane>
                    <el-tab-pane label="My Fields">My Fields</el-tab-pane>
                    <el-tab-pane label="Marketing Preview">Role</el-tab-pane>
                  </el-tabs>
              </template>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-6 col-md-3 offset-md-5">
                <button type="submit" class="btn btn-theme-main--default btn-theme-main--primary">
                  Save Inventory
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'lodash'
import VueFormGenerator from 'vue-form-generator'
import { Tabs, TabPane } from 'element-ui'
// import 'vue-form-generator/dist/vfg.css'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

export default {
  layout: 'DashboardLayout',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    [Tabs.name]: Tabs,
    [TabPane.name]: TabPane
  },
  async asyncData(context) {
    try {
      const invRef = await context.app.$fireStore
        .collection('inventory')
        .doc(context.route.params.id)
        .get()
      
        
      const imgArry =
        invRef.data().images && invRef.data().images.length
          ? invRef.data().images.map((img) => {
              return {
                source: img.publicUrl,
                options: {
                  type: 'local',
                  file: {
                    name: img.name,
                    size: img.sizeInBytes,
                    type: img.type ? img.type : 'image/jpg',
                  },
                  metadata: {
                    poster: img.publicUrl,
                  },
                },
              }
            })
          : []
          console.log(invRef.data())
      return { snapshot: invRef.data(), inventory_images: imgArry }
    } catch (error) {
      console.log(error)

      // context.error({
      //   statusCode: context.error.response.status,
      //   message: context.error.response.data
      // })
    }
  },
  data() {
    return {
      inventory_images: [],
      snapshot: {},
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true,
        validateAsync: true,
      },
      activeName: 'first'
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event)
    },

    filesChange(files) {
      this.inputs.file = files
    },
    async updateInventory() {
      try {
        const invId = this.$route.params.id
        this.snapshot.last_8_vin = this.last8Vin
        const itemToUpdate = this.$fireStore.collection('inventory').doc(invId)
        const m = this.snapshot
        const name = `${m.year.name} ${m.make.name} ${m.model.name}`
        await itemToUpdate.update({
          name,
          ...this.snapshot,
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })

        swal.fire({
          title: `Success`,
          text: `Updated ${name}`,
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-success',
          type: 'success',
          showLoaderOnConfirm: true,
          onDestroy: this.reset,
        })
      } catch (e) {
        console.log(e)
      }
    },
    async updateFilesOrder(files) {
      console.log(`files ordered ${JSON.stringify(files)}`)
      this.snapshot.images = await files
    },
    newFile(e) {
        this.snapshot.images.push(e);
        console.log(this.snapshot.images);
    },
    deleteFile(e){
        this.deleteImage("publicUrl", e);
        console.log(this.snapshot.images);
    },
    revertFileUpload(e){
        var stillLeft = true;
        do{
            var index = this.deleteImage("id", e);;
            if(index == -1){
                stillLeft = false;
            }
        }while(stillLeft)
        console.log(this.snapshot.images);
    },
    reset() {
      setTimeout(() => {
        window.location.reload(true)
      }, 500)
    },
    dynamicSort(property) {
        var sortOrder = 1;
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    },  
    loadChildList(data_key, field, list_key){
        if(this.snapshot[field]){
            var data = _.find(this.dynofields, { id: data_key })
            if(data){
                var models =  _.find(data.values, { name: this.snapshot[field].name });
                if(models && models[list_key]){
                    return models[list_key].slice().sort(this.dynamicSort("name"))
                }
            }
        }
       return [];
    },
    deleteImage(key, value){
        var index = -1;
        for(var i = 0; i <  this.snapshot.images.length; i++){
            if(this.snapshot.images[i][key] == value){
                index = i;
                break;
            }
        } 
        
        console.log(index);
        if(index != -1){
            this.snapshot.images.splice(index, 1);
        }
        return index;
    },
    // getTotalAxleRating(){
    //     var totalAxleRating = 0;
    //     if(this.snapshot.front_axle){
    //         totalAxleRating += Number(this.snapshot.front_axle.name);
    //     }
    //     if(this.snapshot.rear_axle){
    //         totalAxleRating += Number(this.snapshot.rear_axle.name);
    //     }
    //     if(this.snapshot.third_axle_rating){
    //         totalAxleRating += Number(this.snapshot.third_axle_rating.name);
    //     }
    //     if(this.snapshot.fourth_axle_rating){
    //         totalAxleRating += Number(this.snapshot.fourth_axle_rating.name);
    //     }
    //     this.snapshot.gvwr = totalAxleRating;
    //     var vehicleClasses = _.find(this.dynofields, { id: 'vehicle-class' }).values;
        
    //     for(var i = 0; i < vehicleClasses.length; i++){
    //         var klass = vehicleClasses[i];
    //         if(klass.models.length == 2){
    //             var start = klass.models[0].name;
    //             if(start == "-"){
    //                 start = -1;
    //             }else {
    //                 start = Number(start);
    //             }
    //             var end = klass.models[1].name;
    //             if(end == "+"){
    //                 end = Number(totalAxleRating + 1);
    //             }else {
    //                 end = Number(end);
    //             }
                
    //             if(totalAxleRating >= start && totalAxleRating <= end){
    //                 this.snapshot.vehicle_class = klass.name;
    //                 break;
    //             }
    //         }
            
    //     }
    // }
    
  },
  computed: {
    ...mapState(['dynofields']),
    last8Vin: {
      get() {
        return this.snapshot.vin && this.snapshot.vin.length === 17
          ? this.snapshot.vin
              .substr(this.snapshot.vin.length - 8)
              .match(/.{1,4}/g)
              .join(' ')
          : ''
      },
      set(newValue) {
        this.snapshot.last_8_vin = newValue
      },
    },
    primaryInfo() {
      const changed = false;
      
      return {
        groups: [
          {
            fields: [
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Vin',
                model: 'vin',
                min: 17,
                max: 17,
                required: true,
                hint: 'Minimum 17 characters',
                validator: VueFormGenerator.validators.string,
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Asking Price($)',
                model: 'listing_price',
                min: 2,
                max: 9999999,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 7) {
                    newVal = newVal.toString().slice(0,7);
                    model.listing_price = Number(newVal);
                  }
                }
              },
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Make',
                model: 'make.name',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Engine',
                model: 'engine_model.name',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Unit Price($)',
                model: 'listing_price',
                min: 2,
                max: 9999999,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 7) {
                    newVal = newVal.toString().slice(0,7);
                    model.listing_price = Number(newVal);
                  }
                }
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Mileage',
                model: 'miles',
                placeholder: 'Mileage',
                min: 0,
                max : 9999999,
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 7) {
                    this.changed = true;
                    newVal = newVal.toString().slice(0,7);
                    model.miles = Number(newVal);
                  }
                }
              },

              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Pob',
                model: 'current_location',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },
               {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Category',
                model: 'type.name',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },

              // {
              //   type: 'vueMultiSelect',
              //   model: 'year',
              //   label: 'Year',
              //   placeholder: 'Select Year',
              //   styleClasses: 'col-sm-6 col-md-3',

              //   required: true,
              //   // eslint-disable-next-line no-undef
              //   validator: VueFormGenerator.validators.required,
              //   selectOptions: {
              //     multiple: false,
              //     key: 'name',
              //     label: 'name',
              //     trackBy: 'name',
              //     searchable: true,
              //     closeOnSelect: true,
              //     allowEmpty: true,
              //   },
              //   values: _.find(this.dynofields, { id: 'years' })
              //     ? _.find(this.dynofields, { id: 'years' }).values
              //     : [],
              // },
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',
                label: 'Products',
                model: 'last_8_vin',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },  
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',

                label: 'Model Name',
                model: 'model.name',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-4',

                label: 'Engine Name',
                model: 'engine_make.name',
                min: 2,
                max: 17,
                required: true,
                hint: 'Minimum 2 characters',
                validator: VueFormGenerator.validators.string,
              },
              
              // {
              //   type: 'input',
              //   inputType: 'number',
              //   styleClasses: 'col-sm-6 col-md-3',

              //   label: 'HP Rating',
              //   model: 'hp',
              //   placeholder: 'HP Rating',
              //   min: 0,
              //   max : 650,
              //   validator: VueFormGenerator.validators.number,
              //   onChanged: function(model, newVal, oldVal, field){
              //     if (newVal.toString().length > 3) {
              //       newVal = newVal.toString().slice(0,3);
              //       model.hp = Number(newVal);
              //     }
              //   }
              // },
              
              // {
              //   type: 'input',
              //   inputType: 'number',
              //   styleClasses: 'col-sm-6 col-md-3',

              //   label: 'Engine Hours',
              //   model: 'engine_hours',
              //   placeholder: 'Engine Hours',
              //   min: 0,
              //   max : 99999,
              //   validator: VueFormGenerator.validators.number,
              //   onChanged: function(model, newVal, oldVal, field){
              //     if (newVal.toString().length > 5) {
              //       newVal = newVal.toString().slice(0,5);
              //       model.engine_hours = Number(newVal);
              //     }
              //   }
              // },
            ]
          }
        ]
      }
    }
  }
}
</script>
