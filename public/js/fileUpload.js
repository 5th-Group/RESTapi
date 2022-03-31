FilePond.registerPlugin(
    FilePondPluginFileEncode,
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
)


FilePond.setOptions({
  stylePanelAspectRatio: 150 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150
})

FilePond.parse(document.body)


// const inputElements = document.querySelectorAll('input.filepond');

// Array.from(inputElements).forEach(inputElement => {

//   FilePond.create(inputElement);

// })