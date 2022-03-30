FilePond.registerPlugin(
    FilePondPluginFileEncode,
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
)

const inputElements = document.querySelectorAll('input.filepond');

Array.from(inputElements).forEach(inputElement => {

  FilePond.create(inputElement);

})