import {
  importData,
  saveData,
  refreshView,
  addInputField,
  addSelectField,
  createInputFieldDomElement,
  createSelectFieldDomElement,
} from './assets/functions.js'

let isWorking = false
let form = []
let data = []
const formDom = $('#userForm')

const refresh = () => refreshView(isWorking, form, data)

const addNewField = (position) => {
  Swal.fire({
    title: 'Choose field type',
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: 'Input Field',
    denyButtonText: 'Select Field',
  }).then(async (result) => {
    let newField
    if (result.isConfirmed) newField = await addInputField() // input field
    else if (result.isDenied) newField = await addSelectField() // select field

    if (newField) {
      newField.fieldId = newField.fieldName.replace(/\s/g, '_').toLowerCase() + form.length
      const fieldDom = result.isConfirmed
        ? createInputFieldDomElement(newField)
        : createSelectFieldDomElement(newField)
      form.splice(position, 0, newField)
      if (position === 0) {
        formDom.append(fieldDom)
      } else {
        const prevSis = $(formDom.children()[position - 1])
        $(fieldDom).insertAfter(prevSis)
      }
      saveData('form', form)
      refresh()
    }
  })
}

const initApp = () => {
  form.forEach((field) =>
    formDom.append(
      field.fieldType === 'input'
        ? createInputFieldDomElement(field)
        : createSelectFieldDomElement(field)
    )
  ) // create form fields
}

const regListeners = () => {
  // Register event listeners
  $('#getStarted').click(() => {
    isWorking = true
    refresh()
  })
  $('#addField').click(() => addNewField(0)) // add first field

  $(document).on('click', '.addField', (e) => {
    e.preventDefault()
    const field = $(e.target).closest('.form-input')
    const position = field.index() + 1
    addNewField(position)
  })

  $(document).on('click', '.deleteField', (e) => {
    e.preventDefault()
    const field = $(e.target).closest('.form-input')
    const fieldId = field.find('input').attr('id')
    Swal.fire({
      title: 'Delete field?',
      text: 'This would delete the field and all its data',
      icon: 'warning',
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        const position = field.index()
        form.splice(position, 1)
        field.remove()
        // map through data and remove all entries with fieldId
        data = data.map((entry) => entry.filter((field) => field.fieldId !== fieldId))
        // if form is empty, reset app
        if (!form.length) data = []
        saveData('data', data)
        saveData('form', form)
        refresh()
        if (!form.length) {
          isWorking = false
          refresh()
        }
      }
    })
  })

  $('form').on('submit', (e) => {
    e.preventDefault()
    Swal.fire({
      title: 'Save form?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Save',
      denyButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const fields = $('form').find('input, select')
        let formdata = []
        fields.each((index, field) => {
          const id = $(field).attr('id')
          const value = $(field).val()
          const { fieldName, fieldId } = form.find((f) => f.fieldId === id)
          formdata = [...formdata, { fieldName, fieldId, value }]
        })
        $('form').trigger('reset')
        data.push(formdata)
        saveData('data', data)
        refresh()
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    })
  })
}

$(async function () {
  await importData().then((res) => {
    if (res.data?.length || res.form?.length) {
      isWorking = true
      data = res.data
      form = res.form
    }
  })
  initApp()
  refresh()
  regListeners()
})
