(() => {
    const action = new PlugIn.Action(async function (selection, sender) {
        const lib = this.followUpTaskLib;
        const syncedPrefs = lib.loadSyncedPrefs();
        // get current preferences or set defaults if they don't yet exist
        const tagsToShow = lib.tagsToShow();
        // create and show form
        const prefForm = new Form();
        prefForm.addField(new Form.Field.MultipleOptions('tags', 'Tags to Include', flattenedTags, flattenedTags.map(t => t.name), tagsToShow), null);
        await prefForm.show('Preferences: Follow-Up Task', 'OK');
        // save preferences
        syncedPrefs.write('tagIDs', prefForm.values.tags.map(t => t.id.primaryKey));
    });
    action.validate = function (selection, sender) {
        return true;
    };
    return action;
})();
