<template>
  <SlideYUpTransition :duration="animationDuration">
    <div
      v-show="show"
      class="modal fade"
      :class="[{ 'show d-block': show }, { 'd-none': !show }]"
      tabindex="-1"
      role="dialog"
      :aria-hidden="!show"
      @mousedown.self="closeModal"
    >
      <div
        class="modal-dialog modal-dialog-centered"
        :class="['modal-xl form', modalClasses]"
      >
        <div
          class="modal-content"
          :class="[
            gradient ? `bg-gradient-${gradient}` : '',
            modalContentClasses,
          ]"
        >
          <div>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              @click="closeModal"
            >
              <span :aria-hidden="!show">×</span>
            </button>
          </div>

          <div class="modal-body" :class="bodyClasses">
            <card
              type="secondary"
              header-classes="bg-transparent"
              body-classes=""
              class="border-0 mb-0"
            >


              <form-wizard title="Add Inventory" subtitle="Complete this form below" @on-complete="addInventory"> 
                <tab-content title="Step 1" icon="ti-user">
                  <vue-form-generator
                    :schema="schema_1"
                    :model="model"
                    :options="formOptions"
                  ></vue-form-generator>
                    
                  <div class="form-group">
                    <label class="form-control-label">Images</label>

                    <fp-uploader
                      class="cursor-pointer"
                      label="Add Images"
                      :allow-multiple="true"
                      :collection="'inventory'"
                      :loaded-files="[]"
                      @listFiles="updateFiles"
                      @orderFiles="updateFilesOrder"
                    />
                  </div>
                </tab-content>
                
                <tab-content title="Step 2" icon="ti-check">
                  <vue-form-generator
                    :schema="schema_2"
                    :model="model"
                    :options="formOptions"
                  ></vue-form-generator>
                </tab-content>
                  
                  
                <tab-content title="Step 3" icon="ti-check">
                  <vue-form-generator
                    :schema="schema_3"
                    :model="model"
                    :options="formOptions"
                  ></vue-form-generator>
                </tab-content>
                  
                  
                <tab-content title="Last Step" icon="ti-check">
                  <vue-form-generator
                    :schema="schema_4"
                    :model="model"
                    :options="formOptions"
                  ></vue-form-generator>
                </tab-content>
              </form-wizard>
              <!--form @submit.prevent="addInventory">
                
                
                <button type="submit" class="btn btn-primary">
                  Add Invetory
                </button>
              </form-->
            </card>
          </div>

          <div class="modal-footer" :class="footerClasses"></div>
        </div>
      </div>
    </div>
  </SlideYUpTransition>
</template>
<script>
import _ from 'lodash'

import { SlideYUpTransition } from 'vue2-transitions'
import VueFormGenerator from 'vue-form-generator'
import { customAlphabet } from 'nanoid'
import { mapState } from 'vuex'
import 'vue-form-generator/dist/vfg.css'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'
const nanoid = customAlphabet('1234567890abcdef', 10)

export default {
  name: 'InventoryModal',
  components: {
    SlideYUpTransition,
    // eslint-disable-next-line vue/no-unused-components
    'vue-form-generator': VueFormGenerator.component,
  },
  props: {
    show: Boolean,
    showClose: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: '',
      validator(value) {
        const acceptedValues = ['', 'notice', 'mini']
        return acceptedValues.includes(value)
      },
      description: 'Modal type (notice|mini|"") ',
    },
    modalClasses: {
      type: [Object, String],
      default: '',
      description: 'Modal dialog css classes',
    },
    size: {
      type: String,
      description: 'Modal size',
      default: 'lg',
      validator(value) {
        const acceptedValues = ['', 'sm', 'lg', 'xl']
        return acceptedValues.includes(value)
      },
    },
    modalContentClasses: {
      type: [Object, String],
      description: 'Modal dialog content css classes',
      default: '',
    },
    gradient: {
      type: String,
      description: 'Modal gradient type (danger, primary etc)',
      default: '',
    },
    headerClasses: {
      type: [Object, String],
      description: 'Modal Header css classes',
      default: '',
    },
    bodyClasses: {
      type: [Object, String],
      description: 'Modal Body css classes',
      default: '',
    },
    footerClasses: {
      type: [Object, String],
      description: 'Modal Footer css classes',
      default: '',
    },
    animationDuration: {
      type: Number,
      default: 500,
      description: 'Modal transition duration',
    },
  },
  methods: {
    async addInventory() {
      try {
        this.model.last_8_vin = this.last8Vin
        const itemToAdd = this.$fireStore.collection('inventory').doc()
        const m = this.model
        const name = `${m.year.name} ${m.make.name} ${m.model.name}`
        const addedItem = await itemToAdd.set({
          name,
          ...this.model,
          createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })
        console.log(addedItem)

        swal.fire({
          title: `Success`,
          text: `New ${name} Added`,
          buttonsStyling: false,
          confirmButtonClass: 'btn btn-success',
          type: 'success',
          onAfterClose: this.clearForm(true),
        })
      } catch (e) {
        console.log(e)
      }
    },
    async updateFilesOrder(files) {
      console.log(`files ordered ${JSON.stringify(files)}`)
      this.model.images = await files
    },
    async updateFiles(e) {
      console.log(`files changed ${JSON.stringify(e)}`)
      this.model.images = await e
    },
    clearForm(reload) {
        
      Object.keys(this.model).forEach((key) => {
          this.model[key] = ''
      })
      if(reload){
          setTimeout(() => {
              window.location.reload(true)
          }, 800)
      }else{
        this.model.stockid = nanoid();
        this.model.on_website= false;
        this.model.ecm_verified= false;
        this.model.steerable_drop_axle= false;
        this.model.double_frame = false;
        
        this.model.apu = false;
        this.model.bunk_heater = false;
        this.model.refigerator = false;
          
        this.model.engine_brake = false;
        this.model.headache_rack = false;
        this.model.a_s_5th_wheel = false;  
        this.model.has_side_fairings = false; 
        this.model.roof_fairing = false;  
        this.model.pto = false;
        this.model.pump = false;
        this.model.blower = false;   
        this.model.wet_kit = false;
        this.model.full_lockers = false;
        this.model.advertised = false;
        this.model.ecm_verifed = false;    
      }
    },  
    closeModal() {
      this.$emit('update:show', false)
      this.$emit('close')
      this.clearForm(false);
    },
    loadAllTransmissionTypes(transmissions) {
      var types = [];
      for(var i = 0; i < transmissions.length; i++){
          for(var j = 0; j < transmissions[i].types.length; j++){
              types.push(transmissions[i].types[j])
          }
      }  
      return types;
    },
    getTotalAxleRating(){
        var totalAxleRating = 0;
        if(this.model.front_axle){
            totalAxleRating += Number(this.model.front_axle.name);
        }
        if(this.model.rear_axle){
            totalAxleRating += Number(this.model.rear_axle.name);
        }
        if(this.model.third_axle_rating){
            totalAxleRating += Number(this.model.third_axle_rating.name);
        }
        if(this.model.fourth_axle_rating){
            totalAxleRating += Number(this.model.fourth_axle_rating.name);
        }
        this.model.gvwr = totalAxleRating;
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
                    this.model.vehicle_class = klass.name;
                    break;
                }
            }
            
        }
    },
    dynamicSort(property) {
        var sortOrder = 1;
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }
  },
    

    
  data() {
    return {
      model: {
        count: 1,
        third_axle_rating: '',
        third_axle_type: '',
        fourth_axle_rating:'',
        advertised: false,
        axles: '',
        brake_type: '',
        bunk_type: '',
        capacity: '',
        category: '',
        collaboration: '',
        color: '',
        composition: '',
        condition: '',
        current_location: '',
        ecm_verifed: false,
        engine_make: '',
        engine_model: '',
        engine_hours: '',
        expenses: '',
        front_axle: '',
        gear_ratio: '',
        hp: '',
        length_of_body: '',
        listing_price: '',
        make: '',
        miles: '',
        model: '',
        on_website: false,
        ecm_verified: false,
        steerable_drop_axle: false,
        double_frame : false,
        
        apu : false,
        bunk_heater : false,
        refigerator : false,
          
        engine_brake : false,
        headache_rack : false,
        a_s_5th_wheel : false,  
        has_side_fairings : false,  
        roof_fairing : false,  
        pto : false,
        pump : false,
        blower : false,   
        wet_kit : false,
        full_lockers : false,  
          
        side_fairings : '',    
        options_accessories: '',
        product_type: '',
        rear_axle: '',
        reefer_make: '',
        slug: '',
        sell: '',
        sleeper_type: '',
        sleeper_size: '',
        state: '',
        status: '',
        suspension: '',
        tank_type: '',
        tires: '',
        transmission: '',
        transmission_make: '',
        transmission_type: '',
        transport: '',
        type: '',
        unit_type: '',
        vendors: '',
        vin: '',
        last_8_vin: '',
        wheels: '',
        wheel_base: '',
        year: '',
        images: [],
        gvwr:'',
        vehicle_class:'',
        ad_description:'',
        stockid: nanoid(),
      },
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true,
        validateAsync: true,
      },
    }
  },
  computed: {
    ...mapState(['dynofields']),
    last8Vin: {
      get() {
        return this.model.vin && this.model.vin.length === 17
          ? this.model.vin
              .substr(this.model.vin.length - 8)
              .match(/.{1,4}/g)
              .join(' ')
          : ''
      },
      set(newValue) {
        this.model.last_8_vin = newValue
      },
      //   },

      //    set(newValue) {
      // this.model.last_8_vin = newValue
    },

    schema_1() {
      return {
        fields: [
          {
            type: 'input',
            inputType: 'text',
            label: 'Stock ID',
            model: 'stockid',
            readonly: true,
            disabled: true,
          },
          {
            type: 'input',
            inputType: 'number',
            label: 'Count',
            model: 'count',
            placeholder: '1',
            step: 1,
            min: 1,
          },
          {
            type: 'vueMultiSelect',
            model: 'category',
            label: 'Unit Category',
            placeholder: 'Select Unit Category',
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
            values: _.find(this.dynofields, { id: 'categories' }).values.slice().sort(this.dynamicSort("name")),
            onChanged: function(model, newVal, oldVal, field){
                model.type = '';
            }  
          },
          {
            type: 'vueMultiSelect',
            model: 'type',
            label: 'Unit Type',
            placeholder: 'Select Unit Type',
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
            values: this.model.category ? this.model.category.types.slice().sort(this.dynamicSort("name")) : [],
//            onChanged: function(model, newVal, oldVal, field){
//                if (newVal && newVal.name == "Sleeper") {
//                    model.apu = false;
//                    model.bunk_heater = false;
//                    model.refigerator = false;
//                }
//            }  
          },
            
          {
            type: 'input',
            inputType: 'text',
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
            values: _.find(this.dynofields, { id: 'years' }).values.slice().sort(this.dynamicSort("name")),
          },

          {
            type: 'vueMultiSelect',
            model: 'make',
            label: 'Make',
            placeholder: 'Select Make',
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
            values: _.find(this.dynofields, { id: 'makes' }).values.slice().sort(this.dynamicSort("name")),
            onChanged: function(model, newVal, oldVal, field){
                model.model = '';
            }    
          },

          {
            type: 'vueMultiSelect',
            model: 'model',
            label: 'Model',
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
            values: this.model.make ? this.model.make.models.slice().sort(this.dynamicSort("name")) : [],
          },

          {
            type: 'vueMultiSelect',
            model: 'engine_make',
            label: 'Engine Make',
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
            values: _.find(this.dynofields, { id: 'engine-makes' }).values.slice().sort(this.dynamicSort("name")),
            onChanged: function(model, newVal, oldVal, field){
                model.engine_model = '';
            }  
          },

          {
            type: 'vueMultiSelect',
            model: 'engine_model',
            label: 'Engine Model',
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
            values: this.model.engine_make ? this.model.engine_make.models.slice().sort(this.dynamicSort("name")) : [],
          },
          {
            type: 'input',
            inputType: 'number',
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
          }
        ],
      }
    },
          
    schema_2() {
      return {
        fields: [
          {
            type: 'vueMultiSelect',
            model: 'transmission_type',
            label: 'Transmission Type',
            placeholder: 'Select Transmission Type',
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
            values: this.model.transmission_type ? this.model.transmission_type.types.slice().sort(this.dynamicSort("name")) : this.loadAllTransmissionTypes(_.find(this.dynofields, { id: 'transmission' }).values).slice().sort(this.dynamicSort("name")),
          },
          {
            type: 'vueMultiSelect',
            model: 'gear_ratio',
            label: 'Gear Ratio',
            placeholder: 'Select Gear Ratio',
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
            placeholder: 'Select Color',
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
            values: _.find(this.dynofields, { id: 'colors' }).values.slice().sort(this.dynamicSort("name")),
          },    
         {
            type: 'input',
            inputType: 'number',
            label: 'GVWR',
            model: 'gvwr',
            disabled: true,
          },
            
          {
            type: 'input',
            inputType: 'text',
            model: 'vehicle_class',
            label: 'Vehicle Class',
            disabled: true,
          },
            
        ],
      }
    },
      
    schema_3() {
      return {
        fields: [
          {
            type: 'vueMultiSelect',
            model: 'sleeper_size',
            label: 'Sleeper Size',
            placeholder: 'Select Sleeper Size',
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
            styleClasses:'col-md-6'
          },

          {
            type: 'switch',
            label: 'Apu',
            model: 'apu',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-6'
          },     
            
            
          {
            type: 'switch',
            label: 'Headache Rack',
            model: 'headache_rack',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-6'
            
          },
            
          {
            type: 'switch',
            label: 'Bunk Heater',
            model: 'bunk_heater',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-6'
          },   
            
          {
            type: 'switch',
            label: 'A/S 5th Wheel',
            model: 'a_s_5th_wheel',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-6'
          },
            
          {
            type: 'switch',
            label: 'Refigerator',
            model: 'refigerator',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-6'
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
            styleClasses:'col-md-12'
          },
            
          {
            type: 'switch',
            label: 'Roof Fairing',
            model: 'roof_fairing',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
          },
            
          {
            type: 'switch',
            label: 'Pto',
            model: 'pto',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
          },
            
          {
            type: 'switch',
            label: 'Pump',
            model: 'pump',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
          },
            
          {
            type: 'switch',
            label: 'Blower',
            model: 'blower',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
          },
            
          {
            type: 'switch',
            label: 'Web kit',
            model: 'wet_kit',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
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
            styleClasses:'col-md-12'
          },    
          {
            type: 'switch',
            label: 'Full Lockers',
            model: 'full_lockers',
            textOn: 'Yes',
            textOff: 'No',
            styleClasses:'col-md-12'
          },
        ],
      }
    },
      
    schema_4() {
      return {
        fields: [
          {
            type: 'vueMultiSelect',
            model: 'status',
            label: 'Unit Status',
            placeholder: 'Select Unit Status',
            required:false,
            validator: VueFormGenerator.validators.required,
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
            maxlength:120
          },
            
          {
            type: 'vueMultiSelect',
            model: 'condition',
            label: 'Unit Condition',
            placeholder: 'Select Unit Condition',
            required:false,
            validator: VueFormGenerator.validators.required,
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
            placeholder: 'Enter Description'
          },
            
          {
            type: 'switch',
            label: 'Publish',
            model: 'on_website',
            textOn: 'Active',
            textOff: 'Inactive',
          },  
        ],
      }
    },
  
      
  },
  watch: {
    show(val) {
      const documentClasses = document.body.classList
      if (val) {
        documentClasses.add('modal-open')
      } else {
        documentClasses.remove('modal-open')
      }
    },
  },
}
    

</script>
<style>
.modal.show {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
