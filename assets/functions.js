export const refreshView = (isWorking, form, data) => {
  if (!isWorking) {
    $('#getStarted span').html('playlist_add')
    $('.workArea').fadeOut(() => {
      $('#onboardText').fadeIn()
      $('#getStarted').fadeIn()
    })
  } else {
    $('#getStarted').fadeOut(() => {
      $('#onboardText').fadeOut()
      $('.workArea').fadeIn()
    })
    if (form.length) {
      $('.workForm .skeleton ').fadeOut()
      $('#submitForm').fadeIn()
      $('.formWrapper').css('height', '100%')

      //append action buttons to each field
      $('.form-input .actionButtons').html(`
        <button type="button" class="addField action-button justify-center"><span class="material-symbols-outlined">add_circle</span></button>
        <button type="button" class="deleteField action-button justify-center"><span class="material-symbols-outlined">delete</span></button>
      `)
    } else {
      $('.workForm .skeleton ').fadeIn()
      $('#submitForm').fadeOut()
      $('.formWrapper').css('height', 'auto')
    }

    if (data.length) {
      $('table').html(tableTemplate(form, data))
      $('.workTable .skeleton').fadeOut(() => {
        $('table').fadeIn()
      })
    } else {
      $('table').fadeOut(() => {
        $('table').html('')
        $('.workTable .skeleton').fadeIn()
      })
    }
  }
}

export const importData = async () => {
  try {
    const data = await localStorage.getItem('data')
    const form = await localStorage.getItem('form')
    return {
      data: JSON.parse(data) || [],
      form: JSON.parse(form) || [],
    }
  } catch (e) {
    console.log(e)
  }
}

export const saveData = async (key, data) => {
  try {
    await localStorage.setItem([key], JSON.stringify(data))
  } catch (e) {
    console.log(e)
  }
}

export const addInputField = async () => {
  const { value: inputField } = await Swal.fire({
    title: 'Create a new input field',
    html: `
      <input id="fieldName" type="text" class="swal2-input" placeholder="Field Name *">
      <input id="fieldPlaceholder" type="text" class="swal2-input" placeholder="Field Placeholder">
      <label class="swal2-checkbox">
        <input type="checkbox" name="fieldRequired" id="fieldRequired" >
        <span class="swal2-label">Field required</span>
      </label>

    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      if (!$('#fieldName').val()) {
        Swal.showValidationMessage('Please name your field')
      } else {
        return {
          fieldName: $('#fieldName').val(),
          fieldPlaceholder: $('#fieldPlaceholder').val(),
          fieldRequired: $('#fieldRequired').is(':checked'),
          fieldType: 'input',
        }
      }
    },
  })

  return inputField
}

export const addSelectField = async () => {
  $(document)
  const { value: selectField } = await Swal.fire({
    title: 'Create a new select field',
    html: `
      <input id="fieldName" type="text" class="swal2-input" placeholder="Field Name *">
      <input id="fieldPlaceholder" type="text" class="swal2-input" placeholder="Field Placeholder">
      <input id="fieldOptions" type="text" class="swal2-input" placeholder="Option one || Option Two .....">
      <label for ="fieldOptions" class="swal2-label">Separate options with ||</label>
      <label class="swal2-checkbox">
        <input type="checkbox" name="fieldRequired" id="fieldRequired" >
        <span class="swal2-label">Field required</span>
      </label>

    `,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      if (!$('#fieldName').val()) {
        Swal.showValidationMessage('Please name your field')
      } else if (!$('#fieldOptions').val()) {
        Swal.showValidationMessage('Please add at least one option')
      } else {
        return {
          fieldName: $('#fieldName').val(),
          fieldPlaceholder: $('#fieldPlaceholder').val(),
          fieldOptions: $('#fieldOptions')
            .val()
            .split('||')
            .map((option) => option.trim()),
          fieldRequired: $('#fieldRequired').is(':checked'),
          fieldType: 'select',
        }
      }
    },
  })

  return selectField
}

export const createInputFieldDomElement = (field) => {
  const { fieldName, fieldPlaceholder, fieldRequired, fieldId } = field
  const newField = `
    <div class="form-input">
      <div>   
        <label for="${fieldId}">${fieldName}</label>
        <input type="text" id="${fieldId}" placeholder="${fieldPlaceholder} ${
    fieldRequired ? '*' : ''
  }" ${fieldRequired ? 'required' : ''}>
      </div>
      <div class="actionButtons"></div>
    </div>
  `

  return newField
}

export const createSelectFieldDomElement = (field) => {
  const { fieldName, fieldOptions, fieldPlaceholder, fieldRequired, fieldId } = field
  const options = fieldOptions.map((option) => `<option value="${option}">${option}</option>`)
  const newField = `
    <div class="form-input">
      <div>   
        <label for="${fieldId}">${fieldName}</label>
        <select id="${fieldId}" ${fieldRequired ? 'required' : ''}>
          <option value="" disabled selected>${fieldPlaceholder}</option>
          ${options}
        </select>
      </div>
      <div class="actionButtons"></div>
    </div>
  `

  return newField
}

export const tableTemplate = (form, data) => {
  const t = form.map((field) => {
    const { fieldName, fieldId } = field
    const values = data.map((d) => d.find((f) => f.fieldId === fieldId)?.value || '-')
    return {
      fieldName,
      values,
    }
  })
  if (!t.length) return ''
  const headTemplate = t
    .map((field) => `<th>${field.fieldName}</th>`)
    .join('')
    .trim()

  const bodyTemplate = t[0].values
    .map((_, index) => {
      const row = t.map((field) => `<td>${field.values[index]}</td>`).join('')
      return `<tr>${row}</tr>`
    })
    .join('')
    .trim()

  return `
      <thead>
        <tr>
          ${headTemplate}
        </tr>
      </thead>
      <tbody>
        ${bodyTemplate}
      </tbody>
  `
}
