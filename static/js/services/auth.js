// Helper function to create input fields
export function createField(labelText, inputType, name, id) {
  const div = document.createElement('div');

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  label.className = 'block text-sm font-medium text-gray-700';
  div.appendChild(label);

  let input;
  if (inputType === 'select') {
    input = document.createElement('select');
    ['Male', 'Female', 'Other'].forEach((optionText) => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      input.appendChild(option);
    });
  } else {
    input = document.createElement('input');
    input.type = inputType;
  }

  input.name = name;
  input.id = id;
  input.required = true;
  input.className = 'mt-1 w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400';

  div.appendChild(input);
  return div;
}
