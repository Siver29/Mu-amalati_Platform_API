function DynamicField({
  field,
  value,
  onChange,
  isEditing = false,
}) {
  const {
    field_type,
    name_en,
    is_required,
    placeholder_en,
    options = [],
  } = field

  const fieldId =
    `dynamic-field-${field.id}`

  const baseInputClass =
    'mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30'

  const labelClass =
    'block text-sm font-medium text-gray-700 dark:text-gray-300'

  const handleInputChange = (event) => {
    const {
      value: inputValue,
    } = event.target

    onChange(
      field.id,
      inputValue
    )
  }

  const handleCheckboxChange = (
    event
  ) => {
    onChange(
      field.id,
      event.target.checked
    )
  }

  // --------------------------------------------------
  // Text
  // --------------------------------------------------

  if (field_type === 'text') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder_en || ''}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Textarea
  // --------------------------------------------------

  if (field_type === 'textarea') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <textarea
          id={fieldId}
          rows="5"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder_en || ''}
          required={is_required}
          className={`${baseInputClass} resize-none`}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Number
  // --------------------------------------------------

  if (field_type === 'number') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="number"
          value={value ?? ''}
          onChange={handleInputChange}
          placeholder={placeholder_en || ''}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Date
  // --------------------------------------------------

  if (field_type === 'date') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="date"
          value={value || ''}
          onChange={handleInputChange}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Date & Time
  // --------------------------------------------------

  if (field_type === 'datetime') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="datetime-local"
          value={value || ''}
          onChange={handleInputChange}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Select
  // --------------------------------------------------

  if (field_type === 'select') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <select
          id={fieldId}
          value={value || ''}
          onChange={handleInputChange}
          required={is_required}
          className={baseInputClass}
        >
          <option value="">
            {placeholder_en ||
              `Select ${name_en}`}
          </option>

          {options.map(
            (option, index) => (
              <option
                key={`${field.id}-${index}`}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      </div>
    )
  }

  // --------------------------------------------------
  // Radio
  // --------------------------------------------------

  if (field_type === 'radio') {
    return (
      <fieldset>
        <legend className={labelClass}>
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </legend>

        <div className="mt-3 space-y-3">
          {options.map(
            (option, index) => (
              <label
                key={`${field.id}-${index}`}
                className="flex items-center gap-3"
              >
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={
                    value === option
                  }
                  onChange={
                    handleInputChange
                  }
                  required={
                    is_required &&
                    index === 0
                  }
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option}
                </span>
              </label>
            )
          )}
        </div>
      </fieldset>
    )
  }

  // --------------------------------------------------
  // Checkbox
  // --------------------------------------------------

  if (field_type === 'checkbox') {
    return (
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={
              handleCheckboxChange
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />

          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {name_en}

            {is_required && (
              <span className="ml-1 text-red-500">
                *
              </span>
            )}
          </span>
        </label>
      </div>
    )
  }

  // --------------------------------------------------
  // File
  // --------------------------------------------------

  if (field_type === 'file') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="file"
          onChange={(event) => {
            onChange(
              field.id,
              event.target.files?.[0] ||
                null
            )
          }}
          /*
           * Create:
           *   required = true when field is required.
           *
           * Edit:
           *   required = false.
           *
           * The Edit page performs its own validation
           * using the existing attachment.
           */
          required={
            !isEditing &&
            is_required
          }
          className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-50 file:px-4 file:py-3 file:text-sm file:font-medium dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200"
        />

        {isEditing && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            An existing file can be kept, or you can choose a new file.
          </p>
        )}
      </div>
    )
  }

  // --------------------------------------------------
  // Currency
  // --------------------------------------------------

  if (field_type === 'currency') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="number"
          min="0"
          step="0.01"
          value={value ?? ''}
          onChange={handleInputChange}
          placeholder={
            placeholder_en || '0.00'
          }
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Email
  // --------------------------------------------------

  if (field_type === 'email') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="email"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder_en || ''}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Phone
  // --------------------------------------------------

  if (field_type === 'phone') {
    return (
      <div>
        <label
          htmlFor={fieldId}
          className={labelClass}
        >
          {name_en}

          {is_required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <input
          id={fieldId}
          type="tel"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder_en || ''}
          required={is_required}
          className={baseInputClass}
        />
      </div>
    )
  }

  // --------------------------------------------------
  // Fallback
  // --------------------------------------------------

  return (
    <div>
      <label
        htmlFor={fieldId}
        className={labelClass}
      >
        {name_en}

        {is_required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={fieldId}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder_en || ''}
        required={is_required}
        className={baseInputClass}
      />
    </div>
  )
}

export default DynamicField