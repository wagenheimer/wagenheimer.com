window.initEasyMDE = (dotNetHelper, initialValue) => {
    // If an instance already exists, destroy it to avoid duplicates
    if (window.currentMDE) {
        window.currentMDE.toTextArea();
        window.currentMDE = null;
    }

    var element = document.getElementById('markdown-editor');
    if (!element) return;

    window.currentMDE = new EasyMDE({
        element: element,
        initialValue: initialValue,
        spellChecker: false,
        placeholder: "Write your amazing content here...",
        autosave: {
            enabled: true,
            uniqueId: "cw_admin_draft",
            delay: 1000,
        },
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });

    // Bind change event to update Blazor model
    window.currentMDE.codemirror.on("change", function () {
        dotNetHelper.invokeMethodAsync('UpdateContent', window.currentMDE.value());
    });
};

window.disposeEasyMDE = () => {
    if (window.currentMDE) {
        window.currentMDE.toTextArea();
        window.currentMDE = null;
    }
};
