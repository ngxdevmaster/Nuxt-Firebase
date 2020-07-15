<template>
  <div class="page-inventory-details">
    <base-header class="pb-6">
      <div class="row align-items-center py-4">
        <div class="col-lg-6 col-7">
          <h6 class="h2 text-white d-inline-block mb-0">
            {{ snapshot.name }}
          </h6>
          <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
            <route-breadcrumb />
          </nav>
        </div>
        <div class="col-lg-6 col-5 text-right">
          <base-button type="theme-main--default">Add New</base-button>
          <base-button type="theme-main--default btn-theme-main--danger">Delete</base-button>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--6">
      <div class="card mb-4">
        <!-- Card header -->
        <!--<div class="card-header">-->
          <!--<h3 class="mb-0">Primary</h3>-->
        <!--</div>-->
        <!-- Card body -->
        <div class="card-body">
          <!-- Form groups used in grid -->
          <!-- <div class="row">
            <div class="col-sm-6 col-md-3">
              {{
                snapshot.engine_hours
                  | currency({
                    symbol: '',
                    thousandsSeparator: ',',
                    fractionCount: '',
                    fractionSeparator: '',
                    symbolPosition: '',
                    symbolSpacing: '',
                  })
              }}

              <base-input
                label="One of three cols"
                placeholder="One of three cols"
              />
            </div>
          </div> -->
          <form @submit.prevent="updateInventory">
            <div class="row">
              <div class="col-sm-6 col-md-4">
                <div class="form-group">
                  <!--<label class="form-control-label">Images</label>-->
                  <fp-uploader
                    class="cursor-pointer"
                    label="Add Images"
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
              <div class="col-sm-6 col-md-8">
                <vue-form-generator
                  :schema="primaryInfo"
                  :model="snapshot"
                  :options="formOptions"
                ></vue-form-generator>
              </div>

            </div>

            <div class="row">
              <div class="col-sm-6 col-md-12">
                <vue-form-generator
                  :schema="schema"
                  :model="snapshot"
                  :options="formOptions"
                ></vue-form-generator>
              </div>
            </div>

            <div class="row">
              <div class="col-sm-6 col-md-3">
                <button type="submit" class="btn btn-theme-main--default btn-theme-main--primary">
                  Update Inventory
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
 
    
// import 'vue-form-generator/dist/vfg.css'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'


    
export default {
  layout: 'DashboardLayout',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    
  },
  async asyncData(context) {
    try {
      const invRef = await context.app.$fireStore
        .collection('inventory')
        .doc(context.route.params.id)
        .get()
      
      console.log(invRef.date);  
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
    }
  },
  methods: {
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
    getTotalAxleRating(){
        var totalAxleRating = 0;
        if(this.snapshot.front_axle){
            totalAxleRating += Number(this.snapshot.front_axle.name);
        }
        if(this.snapshot.rear_axle){
            totalAxleRating += Number(this.snapshot.rear_axle.name);
        }
        if(this.snapshot.third_axle_rating){
            totalAxleRating += Number(this.snapshot.third_axle_rating.name);
        }
        if(this.snapshot.fourth_axle_rating){
            totalAxleRating += Number(this.snapshot.fourth_axle_rating.name);
        }
        this.snapshot.gvwr = totalAxleRating;
        var vehicleClasses = _.find(this.dynofields, { id: 'vehicle-class' }).values;
        
        for(var i = 0; i < vehicleClasses.length; i++){
            var klass = vehicleClasses[i];
            if(klass.models.length == 2){
                var start = klass.models[0].name;
                if(start == "-"){
                    start = -1;
                }else {
                    start = Number(start);
                }
                var end = klass.models[1].name;
                if(end == "+"){
                    end = Number(totalAxleRating + 1);
                }else {
                    end = Number(end);
                }
                
                if(totalAxleRating >= start && totalAxleRating <= end){
                    this.snapshot.vehicle_class = klass.name;
                    break;
                }
            }
            
        }
    }
    
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
      return {
        groups: [
          {
            legend: "Section 1",
            fields: [
              {
                type: 'vueMultiSelect',
                styleClasses: 'col-sm-6 col-md-3',
                model: 'category',
                label: 'Unit Category',
                placeholder: 'Select Truck Category',
                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'categories' })
                  ? _.find(this.dynofields, { id: 'categories' }).values
                  : [],
                onChanged: function(model, newVal, oldVal, field){
                  model.type = '';
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'type',
                label: 'Unit Type',
                styleClasses: 'col-sm-6 col-md-3',

                placeholder: 'Select Truck Type',
                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: this.loadChildList("categories", "category", "types")
              },
              {
                type: 'input',
                inputType: 'text',
                styleClasses: 'col-sm-6 col-md-3',

                label: 'Enter Vin',
                model: 'vin',
                min: 17,
                max: 17,
                required: true,
                hint: 'Minimum 17 characters',
                validator: VueFormGenerator.validators.string,
              },
              {
                type: 'vueMultiSelect',
                model: 'year',
                label: 'Year',
                placeholder: 'Select Year',
                styleClasses: 'col-sm-6 col-md-3',

                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  trackBy: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'years' })
                  ? _.find(this.dynofields, { id: 'years' }).values
                  : [],
              },
              {
                type: 'vueMultiSelect',
                model: 'make',
                label: 'Make',
                placeholder: 'Select Make',
                styleClasses: 'col-sm-6 col-md-3',

                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'makes' })
                  ? _.find(this.dynofields, { id: 'makes' }).values
                  : [],
                onChanged: function(model, newVal, oldVal, field){
                  model.model = '';
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'model',
                label: 'Model',
                styleClasses: 'col-sm-6 col-md-3',

                placeholder: 'Select Model',
                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: this.loadChildList("makes", "make", "models")
              },
              {
                type: 'vueMultiSelect',
                model: 'engine_make',
                label: 'Engine Make',
                styleClasses: 'col-sm-6 col-md-3',

                placeholder: 'Select Engine Make',
                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'engine-makes' })
                  ? _.find(this.dynofields, { id: 'engine-makes' }).values
                  : [],
                onChanged: function(model, newVal, oldVal, field){
                  model.engine_model = '';
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'engine_model',
                label: 'Engine Model',
                styleClasses: 'col-sm-6 col-md-3',

                placeholder: 'Select Engine Model',
                required: true,
                // eslint-disable-next-line no-undef
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: this.loadChildList("engine-makes", "engine_make", "models")
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-3',

                label: 'HP Rating',
                model: 'hp',
                placeholder: 'HP Rating',
                min: 0,
                max : 650,
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 3) {
                    newVal = newVal.toString().slice(0,3);
                    model.hp = Number(newVal);
                  }
                }
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-3',
                label: 'Mileage',
                model: 'miles',
                placeholder: 'Mileage',
                min: 0,
                max : 9999999,
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 7) {
                    newVal = newVal.toString().slice(0,7);
                    model.miles = Number(newVal);
                  }
                }
              },
              {
                type: 'switch',
                label: 'ECM Verified',
                styleClasses: 'col-sm-6 col-md-3',

                model: 'ecm_verifed',
                textOn: 'Yes',
                textOff: 'No',
                visible(model) {
                  return model && model.miles ;
                }
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-3',

                label: 'Engine Hours',
                model: 'engine_hours',
                placeholder: 'Engine Hours',
                min: 0,
                max : 99999,
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 5) {
                    newVal = newVal.toString().slice(0,5);
                    model.engine_hours = Number(newVal);
                  }
                }
              },
            ]
          }
        ]
      }
    },
    schema() {
      return {
        groups: [
          {
            legend: "Section 2",
            fields: [
              {
                type: 'vueMultiSelect',
                model: 'transmission_type',
                label: 'Transmission Type',
                placeholder: 'Select Transmission Type',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'transmission' }).values.slice().sort(this.dynamicSort("name")),
                onChanged: function(model, newVal, oldVal, field){
                  model.transmission = '';
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'transmission',
                label: 'Transmission',
                placeholder: 'Select Transmission',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: this.loadChildList("transmission", "transmission_type", "types")
              },
              {
                type: 'vueMultiSelect',
                model: 'gear_ratio',
                label: 'Gear Ratio',
                placeholder: 'Select Gear Ratio',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'gear-ratio' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'suspension',
                label: 'Suspension Type',
                placeholder: 'Select Suspension Type',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'suspension-type' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'axles',
                label: 'Axle Configuration',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Axle Configuration',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'axle-configuration' }).values.slice().sort(this.dynamicSort("name")),
                onChanged: function(model, newVal, oldVal, field){
                  if(newVal.name != "Tri-Axle"){
                    model.third_axle_rating = '';
                    model.steerable_drop_axle = false;
                  }

                  if(newVal.name != "Quad-Axle"){
                    model.fourth_axle_rating = '';
                    model.double_frame = false;
                  }
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'front_axle',
                label: 'Front Axle Rating',
                placeholder: 'Select Front Axle Rating',
                required: false,
                input: this.getTotalAxleRating(),
                styleClasses: 'col-sm-6 col-md-3',
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'front-axle-rating' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'rear_axle',
                label: 'Rear Axle Rating',
                placeholder: 'Select Rear Axle Rating',
                required: false,
                input: this.getTotalAxleRating(),
                styleClasses: 'col-sm-6 col-md-3',
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'rear-axle-rating' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'third_axle_rating',
                label: 'Third Axle Rating',
                input: this.getTotalAxleRating(),
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Third Axle Rating',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: '3rd-axle-rating' }).values.slice().sort(this.dynamicSort("name")),
                visible(model) {
                  return model && model.axles && (model.axles.name == "Tri-Axle") ;
                }
              },
              {
                type: 'switch',
                label: 'Steerable Drop Axle',
                styleClasses: 'col-sm-6 col-md-3',
                model: 'steerable_drop_axle',
                textOn: 'Yes',
                textOff: 'No',
                visible(model) {
                  return model && model.axles && (model.axles.name == "Tri-Axle") && model.third_axle_rating ;
                }
              },
              {
                type: 'vueMultiSelect',
                model: 'fourth_axle_rating',
                label: 'Fourth Axle Rating',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Third Axle Rating',
                required: false,
                input: this.getTotalAxleRating(),
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: '3rd-axle-rating' }).values.slice().sort(this.dynamicSort("name")),
                visible(model) {
                  return model && model.axles && model.axles.name == "Quad-Axle" ;
                }
              },
              {
                type: 'switch',
                label: 'Double Frame',
                styleClasses: 'col-sm-6 col-md-3',
                model: 'double_frame',
                textOn: 'Yes',
                textOff: 'No',
                visible(model) {
                  return model && model.axles && (model.axles.name == "Quad-Axle") && model.fourth_axle_rating ;
                }
              },
              {
                type: 'input',
                model: 'wheel_base',
                label: 'Wheel Base',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Enter Wheel Base',
                inputType: "number",
                min:110,
                max:330,
                validator: VueFormGenerator.validators.number
              },
              {
                type: 'vueMultiSelect',
                model: 'brake_type',
                label: 'Brakes',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Brakes',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'brakes' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'wheels',
                label: 'Wheels',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Wheels',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'wheels' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'tires',
                label: 'Tire Size',
                placeholder: 'Select Tire Size',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'tires' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'color',
                label: 'Color',
                styleClasses: 'col-sm-6 col-md-3',
                placeholder: 'Select Color',
                validator: VueFormGenerator.validators.required,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'colors' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'input',
                inputType: 'number',
                styleClasses: 'col-sm-6 col-md-3',
                label: 'GVWR',
                model: 'gvwr',
                disabled: true,
              },
              {
                type: 'input',
                inputType: 'text',
                model: 'vehicle_class',
                styleClasses: 'col-sm-6 col-md-3',
                label: 'Vehicle Class',
                disabled: true,
              }
            ]
          },
          {
            legend: "Section 3",
            fields: [
              {
                type: 'vueMultiSelect',
                model: 'sleeper_size',
                label: 'Sleeper Size',
                placeholder: 'Select Sleeper Size',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'sleeper-size' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'sleeper_type',
                label: 'Sleeper Type',
                placeholder: 'Select Sleeper Type',
                styleClasses: 'col-sm-6 col-md-3',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'sleeper-type' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'vueMultiSelect',
                model: 'bunk_type',
                label: 'Bunk',
                placeholder: 'Select Bunk',
                required: false,
                styleClasses: 'col-sm-6 col-md-3',
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'bunk' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'switch',
                label: 'Engine Brake',
                model: 'engine_brake',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Apu',
                model: 'apu',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Headache Rack',
                model: 'headache_rack',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Bunk Heater',
                model: 'bunk_heater',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'A/S 5th Wheel',
                model: 'a_s_5th_wheel',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Refigerator',
                model: 'refigerator',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Side Fairings',
                model: 'has_side_fairings',
                textOn: 'Yes',
                textOff: 'No',
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal == true) {
                    model.side_fairings = '';
                  }
                },
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Roof Fairing',
                model: 'roof_fairing',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Pto',
                model: 'pto',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Pump',
                model: 'pump',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Blower',
                model: 'blower',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Web kit',
                model: 'wet_kit',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'vueMultiSelect',
                model: 'side_fairings',
                label: 'Side Fairings',
                placeholder: 'Select Side Fairings',
                required: false,
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values:_.find(this.dynofields, { id: 'side-fairings' }).values.slice().sort(this.dynamicSort("name")),
                visible(model) {
                  return model && model.has_side_fairings == true;
                },
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Full Lockers',
                model: 'full_lockers',
                textOn: 'Yes',
                textOff: 'No',
                styleClasses: 'col-sm-6 col-md-3',
              },
            ]
          },
          {
            legend: "Section 4",
            fields:[
              {
                type: 'vueMultiSelect',
                model: 'status',
                label: 'Unit Status',
                placeholder: 'Select Unit Status',
                required:false,
                validator: VueFormGenerator.validators.required,
                styleClasses: 'col-sm-6 col-md-3',
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'status' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'input',
                inputType: 'text',
                label: 'FOB',
                model: 'current_location',
                placeholder: 'Enter Location',
                maxlength:120,
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'vueMultiSelect',
                model: 'condition',
                label: 'Unit Condition',
                placeholder: 'Select Unit Condition',
                required:false,
                validator: VueFormGenerator.validators.required,
                styleClasses: 'col-sm-6 col-md-3',
                selectOptions: {
                  multiple: false,
                  key: 'name',
                  label: 'name',
                  searchable: true,
                  closeOnSelect: true,
                  allowEmpty: true,
                },
                values: _.find(this.dynofields, { id: 'conditions' }).values.slice().sort(this.dynamicSort("name")),
              },
              {
                type: 'input',
                inputType: 'number',
                label: 'Listing Price',
                model: 'listing_price',
                placeholder: 'Enter Listing Price',
                styleClasses: 'col-sm-6 col-md-3',
                min: 0,
                max : 999999,
                validator: VueFormGenerator.validators.number,
                onChanged: function(model, newVal, oldVal, field){
                  if (newVal.toString().length > 6) {
                    newVal = newVal.toString().slice(0,6);
                    model.listing_price = Number(newVal);
                  }
                }
              },
              {
                type: 'textArea',
                label: 'Ad Description',
                model: 'ad_description',
                placeholder: 'Enter Description',
                styleClasses: 'col-sm-6 col-md-3',
              },
              {
                type: 'switch',
                label: 'Publish',
                model: 'on_website',
                textOn: 'Active',
                textOff: 'Inactive',
                styleClasses: 'col-sm-6 col-md-3',
              }
            ]
          }
        ]
      }
    },
  },
}
</script>
