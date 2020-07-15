<template>
  <div>
    <client-only>
      <file-pond
        ref="input"
        :allow-file-poster="true"
        :image-crop-aspect-ratio="'1:1'"
        :allow-image-crop="true"
        class="user-profile-picture"
        accepted-file-types="image/jpeg, image/png, image/svg, image/svg+xml"
        :label-idle="label"
        :files="files"
        :max-parallel-uploads="10"
        :max-files="20"
        :allow-multiple="allowMultiple"
        :style-panel-layout="panelStyle"
        allow-drop="true"
        allow-reorder="true"
        drop-validation="true"
        instant-upload="true"
        :init="handleFilePondInit"
        :image-preview-height="170"
        :server="server"
        @processfile="updateFiles"
        @reorderfiles="updateOrder"
      />
    </client-only>
  </div>
</template>

<script>
import * as uuid from 'uuid/v4'
const id = uuid()
export default {
  name: 'FpFileUpload',
  props: {
    label: {
      type: String,
      default: 'file',
    },
    panelStyle: {
      type: String,
      default: '',
    },
    allowMultiple: {
      type: Boolean,
      default: false,
    },
    fileUploadNumber: {
      type: Number,
      default: 1,
    },
    collection: {
      type: String,
      default: 'inventory',
    },
    loadedFiles: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      image: {},
      images: [],
      files: this.loadedFiles,
      server: {
        load: (source, load, error, progress, abort, headers) => {
          // Should get a file object from the URL here
          // ...
          console.log(source)
          // Should call the progress method to update the progress to 100% before calling load
          // (computable, loadedSize, totalSize)
          progress(true, 0, 1024)

          // Should call the load method with a file object when done
          load(source)

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // Let FilePond know the request has been cancelled
              abort()
            },
          }
        },
        fetch(url, load, error, progress, abort, headers) {
          error('Local files only')
        },
        remove: (source, load, error) => {
            //todo maybe should delete from server as well.
            console.log(source);
            load();
            this.$emit('deleted', source);
        },
        revert: (uniqueFileId, load, error) => {
            console.log(uniqueFileId);
            load();
            this.$emit('revertUpload', uniqueFileId)
        },
        restore(uniqueFileId, load, error, progress, abort, headers) {
          error('r')
        },

        process: (fieldName, file, metadata, load, error, progress, abort) => {
          console.log(file)
          const fileType = file.type
          const storageRef = this.$fireStorage
            .ref(this.collection)
            .child(file.name)

          storageRef.put(file)

          const uploadTask = storageRef.put(file)

          uploadTask.on(
            this.$fireStorageObj.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              const progressTimer =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // console.log("Upload is " + progress + "% done");
              // Should call the progress method to update the progress to 100% before calling load
              // Setting computable to false switches the loading indicator to infinite mode
              progress(true, 1024, 1024)

              switch (snapshot.state) {
                case this.$fireStorageObj.TaskState.PAUSED: // or 'paused'
                  console.log('Upload is paused')
                  break
                case this.$fireStorageObj.TaskState.RUNNING: // or 'running'
                  console.log('Upload is running')
                  break
              }
            },
            (error) => {
              // A full list of error codes is available at
              // https://firebase.google.com/docs/storage/web/handle-errors
              switch (error.code) {
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break

                case 'storage/canceled':
                  // User canceled the upload
                  break
                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break
              }
            },
            () => {
              // Upload completed successfully, now we can get the download URL
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                load(downloadURL)
                  
                  
                var uid = this.uniqueId()
                
                this.image = {
                  id:uid,
                  name: uploadTask.snapshot.ref.name,
                  sizeInBytes: uploadTask.snapshot.totalBytes,
                  privateUrl: uploadTask.snapshot.ref.fullPath,
                  publicUrl: downloadURL,
                  type: fileType,
                  new: true,
                }
                this.images.push(this.image)
                this.$emit('change', this.image)
                this.$emit('listFiles', this.images)
                this.$emit('newFile', this.image)
                load(uid);
                
                return {
                  abort: () => {
                    // Let FilePond know the request has been cancelled
                    console.log('abort')

                    abort()
                  },
                }
              })
            }
          )
        },
      },
    }
  },

  methods: {
    handleFilePondInit() {
      console.log('FilePond has initialized')
      return true
    },
    updateOrder(files) {
      if (!files) return false
      this.images = files.map((f) => {
        return {
          id: f.id,
          name: f.filename,
          sizeInBytes: f.fileSize,
          privateUrl: `inventory/${f.filename}`,
          publicUrl: f.serverId,
          type: f.fileType,
          new: true,
        }
      })
      this.$emit('orderFiles', this.images)
    },
    updateFiles(error, file) {
      if (error) return false
      console.log(file)

      // this.myFiless.push(file.serverId);
      // this.$emit("getFiles", this.myFiless);
    },

    load: (source, load, error, progress, abort, headers) => {
      const myRequest = new Request(source)
      fetch(myRequest).then((response) => {
        response.blob().then((myBlob) => {
          load(myBlob)
        })
      })
    },

    fetch(url, load, error, progress, abort, headers) {
      error('local file only')
    },

    restore(uniqueFileId, load, error, progress, abort, headers) {
      // error();
       console.log(uniqueFileId) 
    },

    revert(uniqueFileId, load, error) {
      console.log(uniqueFileId)

      // Create a reference to the file to delete
      /*   console.log(uniqueFileId)
      let desertRef = this.$storage.ref('brands').child(uniqueFileId)
      desertRef
        .delete()
        .then(() => {
          let index = this.files.indexOf(uniqueFileId)
          if (index > -1) {
            this.files.splice(index, 1)
          }
          load()
        })
        .catch(e => {
          this.handleError(error, e)
        }) */
    },
    handleWarning() {
      console.log('handleWarning')
    },
    handleError(error, e) {
      console.log(error)

      switch (e.code) {
        case 'storage/canceled':
          break
        default:
          console.log(e.message)
      }
    },
    // handleFileAdded() {
    //   console.log('handleFileAdded')
    // },

    async handleFileAdded(
      fieldName,
      file,
      metadata,
      load,
      error,
      progress,
      abort
    ) {
      try {
        console.log('handleFileAdded')
        const storageRef = this.$fireStorage
          .ref(this.collection)
          .child(file.file.name)
        const snapshot = await storageRef.put(file.file, file.metadata)
        const downloadURL = await snapshot.ref.getDownloadURL()
        const fullPath = await snapshot.ref.fullPath
        const thumbUrl = await storageRef.ref(`/thumbs/800/`).getDownloadURL()

        this.image = {
          id,
          name: snapshot.ref.name,
          sizeInBytes: snapshot.totalBytes,
          privateUrl: fullPath,
          publicUrl: downloadURL,
          thumbUrl,
          new: true,
        }
        this.$emit('change', this.image)
      } catch (error) {
        console.log(error)
      }
    },
    handleFileProcessStart() {
      console.log('handleFileProcessStart')
    },

    handleFileProcessProgress() {
      console.log('handleFileProcessStart')
    },
    handleFileProcessAbort() {
      console.log('handleFileProcessAbort')
    },
    handleFileProcessUndo() {
      console.log('handleFileProcessUndo')
    },
    handleFileProcess() {
      console.log('handleFileProcess')
    },
    handleFileRemoved() {
      console.log('handleFileRemoved')
    },
    uniqueId(){
        return Date.now()
    }
  },
}
</script>

<style></style>
