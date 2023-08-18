(() => {
    const lib = new PlugIn.Library(new Version('1.0'));
    lib.loadSyncedPrefs = () => {
        const syncedPrefsPlugin = PlugIn.find('com.KaitlinSalzke.SyncedPrefLibrary', null);
        if (syncedPrefsPlugin !== null) {
            const syncedPrefLib = syncedPrefsPlugin.library('syncedPrefLibrary');
            const SyncedPref = new syncedPrefLib.SyncedPref('com.KaitlinSalzke.followUpTask');
            return SyncedPref;
        }
        else {
            const alert = new Alert('Synced Preferences Library Required', 'For the Follow Up Task plug-in to work correctly, the \'Synced Preferences for OmniFocus\' plug-in (https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.');
            alert.show(() => { });
        }
    };
    lib.getFuzzySearchLib = () => {
        const fuzzySearchPlugIn = PlugIn.find('com.KaitlinSalzke.fuzzySearchLib', null);
        if (!fuzzySearchPlugIn) {
            const alert = new Alert('Fuzzy Search Library Required', 'For the Follow-Up Task plug-in to work correctly, the \'Fuzzy Search\' plug-in (https://github.com/ksalzke/fuzzy-search-library) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.');
            alert.show(null);
        }
        return fuzzySearchPlugIn.library('fuzzySearchLib');
    };
    lib.tagsToShow = () => {
        const syncedPrefs = lib.loadSyncedPrefs();
        const currentSetting = syncedPrefs.read('tagIDs');
        if (currentSetting) {
            return currentSetting.map((id) => Tag.byIdentifier(id));
        }
        else
            return [];
    };
    lib.emptyTask = () => {
        return {
            name: '',
            note: '',
            tags: [],
            flagged: false,
            deferDate: null,
            dueDate: null,
            prerequisites: [],
            dependents: []
        };
    };
    lib.initialForm = (task) => {
        const form = new Form();
        form.addField(new Form.Field.String('taskName', 'New Task', null, null), null);
        form.addField(new Form.Field.Option('propertiesToTransfer', 'Properties To Transfer', ['all_exc_dependencies', 'all_inc_dependencies', 'select'], ['All except dependencies', 'All including dependencies', 'Select manually'], 'all_exc_dependencies', null), null);
        form.validate = (form) => {
            if (!form.values.taskName || form.values.taskName === '')
                return false; // can't proceed if no task name entered
            else
                return true;
        };
        return form;
    };
    lib.propertiesToTransferForm = (task, hasPrereqs, hasDeps) => {
        const newTaskForm = new Form();
        if (task.tags.length > 0)
            newTaskForm.addField(new Form.Field.Checkbox('tags', 'Tags', false), null);
        if (task.flagged)
            newTaskForm.addField(new Form.Field.Checkbox('flagged', 'Flagged', false), null);
        if (task.deferDate !== null)
            newTaskForm.addField(new Form.Field.Checkbox('deferDate', 'Defer Date', false), null);
        if (task.dueDate !== null)
            newTaskForm.addField(new Form.Field.Checkbox('dueDate', 'Due Date', false), null);
        if (task.note !== '')
            newTaskForm.addField(new Form.Field.Checkbox('notes', 'Notes', false), null);
        if (hasPrereqs)
            newTaskForm.addField(new Form.Field.Checkbox('prerequisites', 'Prerequisites', false), null);
        if (hasDeps)
            newTaskForm.addField(new Form.Field.Checkbox('dependents', 'Dependents', false), null);
        return newTaskForm;
    };
    lib.editForm = (originalTask, originalPrereqs, originalDeps, startingDetails) => {
        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
        const editForm = new Form();
        /* name */ editForm.addField(new Form.Field.String('name', 'Name', startingDetails.name, null), null);
        /* tags */
        if (originalTask) {
            const combinedTags = [...startingDetails.tags, ...lib.tagsToShow()];
            const tagsToShow = [...new Set(combinedTags)]; // using Set to remove any duplicates
            editForm.addField(new Form.Field.MultipleOptions('tags', 'Tags', tagsToShow, tagsToShow.map(t => t.name), startingDetails.tags), null);
        }
        /* defer date */
        if (originalTask) {
            editForm.addField(new Form.Field.Date('deferDate', 'Defer Date', startingDetails.deferDate, null), null);
        }
        /* due date */
        if (originalTask) {
            editForm.addField(new Form.Field.Date('dueDate', 'Due Date', startingDetails.dueDate, null), null);
        }
        /* notes */ editForm.addField(new Form.Field.String('notes', 'Notes', startingDetails.note, null), null);
        /* prerequisites */
        if (originalPrereqs.length > 0) {
            editForm.addField(new Form.Field.MultipleOptions('prerequisites', 'Prerequisites', originalPrereqs, originalPrereqs.map(t => t.name), startingDetails.prerequisites), null);
        }
        /* dependents */
        if (originalDeps.length > 0) {
            editForm.addField(new Form.Field.MultipleOptions('dependents', 'Dependents', originalDeps, originalDeps.map(t => t.name), startingDetails.dependents), null);
        }
        /* flag */ editForm.addField(new Form.Field.Checkbox('flagged', 'Set Flag', startingDetails.flagged), null);
        // fields that generate subsequent dialogues
        if (originalTask) {
            editForm.addField(new Form.Field.Checkbox('addTags', 'Add another tag(s)', false), null);
        }
        editForm.addField(new Form.Field.Checkbox('addPrereq', 'Add prerequisite', false), null);
        editForm.addField(new Form.Field.Checkbox('addDep', 'Add dependent', false), null);
        if (originalTask && moveToActionGroupPlugIn) {
            const fuzzySearchLib = lib.getFuzzySearchLib();
            const taskPath = originalTask.parent ? fuzzySearchLib.getTaskPath(originalTask.parent) : 'inbox';
            editForm.addField(new Form.Field.Checkbox('move', `Move? (Current location: ${taskPath})`, false), null);
        }
        return editForm;
    };
    lib.getTaskDetailsFromEditForm = (editForm) => {
        return {
            name: editForm.values.name,
            note: editForm.values.notes,
            tags: editForm.values.tags || [],
            flagged: editForm.values.flagged,
            deferDate: editForm.values.deferDate,
            dueDate: editForm.values.dueDate,
            prerequisites: editForm.values.prerequisites || [],
            dependents: editForm.values.dependents || []
        };
    };
    lib.createTask = (taskDetails, location) => {
        const newTask = new Task(taskDetails.name, location);
        newTask.clearTags(); // stops any tags being inherited inadvertantly
        newTask.note = taskDetails.note;
        newTask.addTags(taskDetails.tags);
        newTask.flagged = taskDetails.flagged;
        newTask.deferDate = taskDetails.deferDate;
        newTask.dueDate = taskDetails.dueDate;
        return newTask;
    };
    lib.addFollowUpTask = async (task) => {
        //=== SET-UP =================================================================
        const dependencyPlugIn = PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus', null);
        const dependencyLibrary = dependencyPlugIn ? dependencyPlugIn.library('dependencyLibrary') : null;
        const dependencies = (dependencyLibrary && task) ? dependencyLibrary.getDependents(task) : [];
        const dependencyString = dependencies.length > 0 ? `\n\nDependent: \n - ${dependencies.map(task => task.name).join('\n - ')}` : '';
        const prerequisites = (dependencyLibrary && task) ? dependencyLibrary.getPrereqs(task) : [];
        const prereqString = prerequisites.length > 0 ? `\n\nPrerequisite: \n - ${prerequisites.map(task => task.name).join('\n - ')}` : '';
        const fuzzySearchLib = lib.getFuzzySearchLib();
        let newTaskDetails = task ? {
            name: task.name,
            note: task.note,
            tags: task.tags,
            flagged: task.flagged,
            deferDate: task.deferDate,
            dueDate: task.dueDate,
            prerequisites: prerequisites,
            dependents: dependencies
        } : lib.emptyTask();
        const moveToActionGroupPlugIn = PlugIn.find('com.KaitlinSalzke.MoveToActionGroup', null);
        const moveToActionGroupLibrary = moveToActionGroupPlugIn ? moveToActionGroupPlugIn.library('moveToActionGroupLib') : null;
        if (task) {
            //=== INITIAL FORM ===========================================================
            const form = lib.initialForm(task);
            await form.show(`ADD FOLLOW-UP TASK${dependencyString}${prereqString}`, 'Confirm');
            newTaskDetails.name = form.values.taskName;
            //=== 'PROPERTIES TO TRANSFER' FORM ==========================================
            switch (form.values.propertiesToTransfer) {
                case 'select':
                    const newTaskForm = lib.propertiesToTransferForm(task, prerequisites.length > 0, dependencies.length > 0);
                    if (newTaskForm.fields.length > 0)
                        await newTaskForm.show('PROPERTIES FOR TRANSFER', 'Confirm'); // if length = 0, there are no properties to transfer so skip this dialogue
                    newTaskDetails.tags = newTaskForm.values.tags ? task.tags : [];
                    newTaskDetails.flagged = newTaskForm.values.flagged ? task.flagged : false;
                    newTaskDetails.deferDate = newTaskForm.values.deferDate ? task.deferDate : null;
                    newTaskDetails.dueDate = newTaskForm.values.dueDate ? task.dueDate : null;
                    newTaskDetails.note = newTaskForm.values.notes ? task.note : null;
                    newTaskDetails.prerequisites = newTaskForm.values.prerequisites ? prerequisites : [];
                    newTaskDetails.dependents = newTaskForm.values.dependents ? dependencies : [];
                    break;
                case 'all_inc_dependencies':
                    break;
                case 'all_exc_dependencies':
                    newTaskDetails.prerequisites = [];
                    newTaskDetails.dependents = [];
                    break;
            }
            // in all cases, remove dependent and prerequisite tags from the list of tags to copy
            const prereqTag = await dependencyLibrary.getPrefTag('prerequisiteTag');
            const depTag = await dependencyLibrary.getPrefTag('dependentTag');
            newTaskDetails.tags = newTaskDetails.tags.filter(tag => ![prereqTag, depTag].includes(tag));
        }
        //=== EDIT TASK FORM ==========================================================
        const editForm = lib.editForm(task, prerequisites, dependencies, newTaskDetails);
        await editForm.show('EDIT NEW TASK DETAILS', 'Confirm');
        const move = editForm.values.move == null ? true : editForm.values.move; // if null, move checkbox wasn't on form and should be moved by default (for a new task)
        newTaskDetails = lib.getTaskDetailsFromEditForm(editForm);
        //=== PREREQ/DEP FORMS ========================================================
        const remainingTasks = flattenedTasks.filter(task => ![Task.Status.Completed, Task.Status.Dropped].includes(task.taskStatus)); //TODO: exclude current task
        const remainingTaskLabels = remainingTasks.map(task => {
            const taskPath = fuzzySearchLib.getTaskPath(task);
            const prereqString = newTaskDetails.prerequisites.includes(task) ? ' [PREREQUISITE] ' : '';
            const depString = newTaskDetails.dependents.includes(task) ? ' [DEPENDENT] ' : '';
            return `${taskPath}${prereqString}${depString}`;
        });
        if (editForm.values.addPrereq) {
            let prereqForm;
            do {
                prereqForm = fuzzySearchLib.searchForm(remainingTasks, remainingTaskLabels, null, null);
                prereqForm.addField(new Form.Field.Checkbox('another', 'Add another prerequisite?', false), null);
                // show form
                await prereqForm.show('ADD PREREQUISITE', 'Confirm');
                // processing
                const prereq = prereqForm.values.menuItem;
                newTaskDetails.prerequisites.push(prereq);
            } while (prereqForm.values.another);
        }
        if (editForm.values.addDep) {
            let depForm;
            do {
                depForm = fuzzySearchLib.searchForm(remainingTasks, remainingTaskLabels, null, null);
                depForm.addField(new Form.Field.Checkbox('another', 'Add another dependent?', false), null);
                await depForm.show('ADD DEPENDENT', 'Confirm');
                // processing
                const dep = depForm.values.menuItem;
                newTaskDetails.dependents.push(dep);
            } while (depForm.values.another);
        }
        //=== TAG FORM ================================================================
        if (editForm.values.addTags === true) {
            let tagForm;
            do {
                const activeTags = flattenedTags.filter(tag => tag.active);
                const activeTagNames = activeTags.map(t => newTaskDetails.tags.includes(t) ? `${t.name} [TAGGED]` : t.name);
                tagForm = fuzzySearchLib.searchForm(activeTags, activeTagNames, null, null);
                tagForm.addField(new Form.Field.Checkbox('another', 'Add another tag?', false), null);
                await tagForm.show('ADD TAG', 'Confirm');
                // processing
                const tag = tagForm.values.menuItem;
                newTaskDetails.tags.push(tag);
            } while (tagForm.values.another);
        }
        //=== CREATE TASK =============================================================
        // create basic task details
        const locationToAdd = task ? task.after : inbox.ending;
        const newTask = lib.createTask(newTaskDetails, locationToAdd);
        // update dependencies
        for (const prereq of newTaskDetails.prerequisites) {
            await dependencyLibrary.addDependency(prereq, newTask);
            await dependencyLibrary.removeDependency(prereq.id.primaryKey, task.id.primaryKey);
        }
        for (const dep of newTaskDetails.dependents) {
            await dependencyLibrary.addDependency(newTask, dep);
            await dependencyLibrary.removeDependency(task.id.primaryKey, dep.id.primaryKey);
        }
        // move the task if specified
        if (move !== false) { // move is either null (form not shown) or true (selected)
            const proj = await moveToActionGroupLibrary.projectPrompt();
            await moveToActionGroupLibrary.actionGroupPrompt([newTask], proj);
        }
    };
    return lib;
})();
